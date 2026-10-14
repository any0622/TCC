import { Injectable } from '@nestjs/common';
import type { EmergencyRepositoryPort, IdempotencyServicePort, OutboxServicePort } from '../ports';
import { TriggerEmergencyCommand, EmergencyResult } from '../dto/emergency.dto';
import { EmergencyEvent } from '../../domain/entities/emergency-event.entity';
import { InvalidCoordinatesException, IdempotencyKeyRequiredException } from '../../domain/exceptions';

@Injectable()
export class TriggerEmergencyUseCase {
  constructor(
    private readonly repository: EmergencyRepositoryPort,
    private readonly idempotency: IdempotencyServicePort,
    private readonly outbox: OutboxServicePort,
  ) {}

  async execute(command: TriggerEmergencyCommand): Promise<EmergencyResult> {
    const hasLatitude = command.latitude !== undefined && command.latitude !== null;
    const hasLongitude = command.longitude !== undefined && command.longitude !== null;

    if (hasLatitude !== hasLongitude) {
      throw new InvalidCoordinatesException();
    }

    if (!command.idempotencyKey) {
      throw new IdempotencyKeyRequiredException();
    }

    const payload = {
      userId: command.userId,
      latitude: command.latitude,
      longitude: command.longitude,
    };

    const idempotencyResult = await this.idempotency.acquire(
      command.idempotencyKey,
      command.userId,
      'emergency:trigger',
      payload,
    );

    if (!idempotencyResult.acquired) {
      switch (idempotencyResult.status) {
        case 'completed':
          return idempotencyResult.existingResult;
        case 'processing':
          throw new Error('Operação de emergência já em andamento');
        case 'conflict_user':
          throw new Error('Chave de idempotência pertence a outro usuário');
        case 'conflict_operation':
          throw new Error('Chave de idempotência usada para operação diferente');
        case 'conflict_payload':
          throw new Error('Chave de idempotência reutilizada com payload diferente');
        default:
          throw new Error('Conflito de idempotência');
      }
    }

    try {
      const result = await this.repository.trigger({
        userId: command.userId,
        latitude: command.latitude,
        longitude: command.longitude,
      });

      await this.outbox.addEvent({
        eventType: 'emergency.triggered',
        aggregateId: result.id,
        payload: {
          emergencyId: result.id,
          userId: command.userId,
          latitude: command.latitude,
          longitude: command.longitude,
          status: result.status,
          triggeredAt: result.triggeredAt,
        },
      });

      await this.idempotency.complete(command.idempotencyKey, true, result);
      return this.toResult(result);
    } catch (error) {
      await this.idempotency.complete(command.idempotencyKey, false, null);
      throw error;
    }
  }

  private toResult(event: EmergencyEvent): EmergencyResult {
    return {
      id: event.id,
      userId: event.userId,
      triggeredAt: event.triggeredAt,
      latitude: event.latitude,
      longitude: event.longitude,
      patientSnapshot: event.patientSnapshot,
      status: event.status,
      notes: event.notes,
    };
  }
}