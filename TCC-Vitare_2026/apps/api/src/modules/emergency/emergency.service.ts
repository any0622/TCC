import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { TriggerEmergencyDto } from './dto/trigger-emergency.dto';
import { EmergencyRepository } from './repositories/emergency.repository';
import { IdempotencyService } from '../../infra/idempotency/idempotency.service';
import { OutboxService } from '../../infra/outbox/outbox.service';
import {
  CursorPaginationOptions,
  CursorPaginatedResult,
} from './repositories/emergency.repository';

@Injectable()
export class EmergencyService {
  constructor(
    private readonly repository: EmergencyRepository,
    private readonly idempotency: IdempotencyService,
    private readonly outbox: OutboxService,
  ) {}

  async trigger(
    userId: string,
    dto: TriggerEmergencyDto,
    idempotencyKey: string,
  ) {
    const hasLatitude = dto.latitude !== undefined && dto.latitude !== null;
    const hasLongitude = dto.longitude !== undefined && dto.longitude !== null;

    if (hasLatitude !== hasLongitude) {
      throw new BadRequestException(
        'Latitude e longitude devem ser enviadas juntas ou ambas omitidas.',
      );
    }

    if (!idempotencyKey) {
      throw new BadRequestException('X-Idempotency-Key header é obrigatório');
    }

    const payload = {
      userId,
      latitude: dto.latitude,
      longitude: dto.longitude,
    };

    const idempotencyResult = await this.idempotency.acquire(
      idempotencyKey,
      userId,
      'emergency:trigger',
      payload,
    );

    if (!idempotencyResult.acquired) {
      switch (idempotencyResult.status) {
        case 'completed':
          return idempotencyResult.existingResult;
        case 'processing':
          throw new ConflictException('Operação de emergência já em andamento');
        case 'conflict_user':
          throw new ConflictException(
            'Chave de idempotência pertence a outro usuário',
          );
        case 'conflict_operation':
          throw new ConflictException(
            'Chave de idempotência usada para operação diferente',
          );
        case 'conflict_payload':
          throw new ConflictException(
            'Chave de idempotência reutilizada com payload diferente',
          );
        default:
          throw new ConflictException('Conflito de idempotência');
      }
    }

    try {
      const result = await this.repository.trigger({
        userId,
        latitude: dto.latitude,
        longitude: dto.longitude,
      });

      await this.outbox.addEvent({
        eventType: 'emergency.triggered',
        aggregateId: result.id,
        payload: {
          emergencyId: result.id,
          userId,
          latitude: dto.latitude,
          longitude: dto.longitude,
          status: result.status,
          triggeredAt: result.triggeredAt,
        },
      });

      await this.idempotency.complete(idempotencyKey, true, result);
      return result;
    } catch (error) {
      await this.idempotency.complete(idempotencyKey, false, null);
      throw error;
    }
  }

  findAllByUser(userId: string) {
    return this.repository.findAllByUser(userId);
  }

  findAllByUserWithCursor(
    userId: string,
    options: CursorPaginationOptions,
  ): Promise<CursorPaginatedResult<any>> {
    return this.repository.findByUserWithCursor(userId, options);
  }
}
