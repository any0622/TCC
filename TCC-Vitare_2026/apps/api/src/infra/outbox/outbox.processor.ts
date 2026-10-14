import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { EmergencyGateway } from '../../modules/emergency/emergency.gateway';
import { OutboxService, PendingOutboxEvent } from './outbox.service';

const MAX_ATTEMPTS = 5;
const BASE_RETRY_DELAY_MS = 1000;

@Injectable()
export class OutboxProcessor implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(OutboxProcessor.name);
  private intervalId: NodeJS.Timeout | null = null;
  private readonly pollIntervalMs: number;

  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
    private readonly emergencyGateway: EmergencyGateway,
    private readonly outbox: OutboxService,
  ) {
    this.pollIntervalMs =
      this.config.get<number>('OUTBOX_POLL_INTERVAL_MS') ?? 5000;
  }

  onModuleInit(): void {
    this.intervalId = setInterval(() => this.process(), this.pollIntervalMs);
    this.logger.log(
      `Outbox processor started with ${this.pollIntervalMs}ms interval`,
    );
  }

  onModuleDestroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.logger.log('Outbox processor stopped');
  }

  async process(): Promise<void> {
    try {
      const events = await this.outbox.getPendingEvents(50);

      for (const event of events) {
        try {
          await this.publishEvent(event);
          await this.outbox.markPublished(event.id);
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : String(error);
          this.logger.warn(
            `Failed to publish outbox event ${event.id}: ${errorMessage}`,
          );

          await this.handleFailure(event.id, errorMessage, event.attempts);
        }
      }
    } catch (error) {
      this.logger.error('Outbox processing error', error);
    }
  }

  private async handleFailure(
    id: string,
    error: string,
    attempts: number,
  ): Promise<void> {
    if (attempts + 1 >= MAX_ATTEMPTS) {
      await this.prisma.outboxEvent.update({
        where: { id },
        data: {
          status: 'FAILED',
          lastError: error,
        },
      });
    } else {
      await this.prisma.outboxEvent.update({
        where: { id },
        data: {
          attempts: { increment: 1 },
          lastError: error,
          status: 'PENDING',
        },
      });
    }
  }

  private calculateRetryDelay(attempts: number): number {
    return BASE_RETRY_DELAY_MS * Math.pow(2, attempts);
  }

  private async publishEvent(event: PendingOutboxEvent): Promise<void> {
    switch (event.eventType) {
      case 'emergency.triggered':
        this.emergencyGateway.broadcastEmergencyTriggered(
          event.aggregateId,
          event.payload,
        );
        break;
      case 'emergency.assigned':
        this.emergencyGateway.broadcastEmergencyAssigned(
          event.aggregateId,
          event.payload,
        );
        break;
      case 'emergency.resolved':
        this.emergencyGateway.broadcastEmergencyResolved(
          event.aggregateId,
          event.payload,
        );
        break;
      default:
        this.logger.warn(`Unknown outbox event type: ${event.eventType}`);
    }
  }
}
