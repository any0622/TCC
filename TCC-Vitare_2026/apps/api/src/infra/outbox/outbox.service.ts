import { Injectable, Logger } from '@nestjs/common';
import type { PrismaService } from '../prisma/prisma.service';

export interface OutboxEventPayload {
  eventType: string;
  aggregateId: string;
  payload: Record<string, unknown>;
}

export interface PendingOutboxEvent {
  id: string;
  eventType: string;
  aggregateId: string;
  payload: Record<string, unknown>;
  attempts: number;
}

@Injectable()
export class OutboxService {
  private readonly logger = new Logger(OutboxService.name);
  private readonly maxAttempts = 5;
  private readonly baseRetryDelayMs = 1000;

  constructor(private readonly prisma: PrismaService) {}

  async addEvent(event: OutboxEventPayload): Promise<void> {
    await this.prisma.outboxEvent.create({
      data: {
        eventType: event.eventType,
        aggregateId: event.aggregateId,
        payload: event.payload as any,
        status: 'PENDING',
      },
    });
  }

  async addEventInTransaction(
    tx: PrismaService,
    event: OutboxEventPayload,
  ): Promise<void> {
    await tx.outboxEvent.create({
      data: {
        eventType: event.eventType,
        aggregateId: event.aggregateId,
        payload: event.payload as any,
        status: 'PENDING',
      },
    });
  }

  async getPendingEvents(limit = 100): Promise<PendingOutboxEvent[]> {
    const events = await this.prisma.outboxEvent.findMany({
      where: {
        status: 'PENDING',
        attempts: { lt: this.maxAttempts },
      },
      orderBy: { createdAt: 'asc' },
      take: limit,
    });

    return events.map((e) => ({
      id: e.id,
      eventType: e.eventType,
      aggregateId: e.aggregateId,
      payload: e.payload as Record<string, unknown>,
      attempts: e.attempts,
    }));
  }

  async markPublished(id: string): Promise<void> {
    await this.prisma.outboxEvent.update({
      where: { id },
      data: {
        status: 'PUBLISHED',
        publishedAt: new Date(),
      },
    });
  }

  async markFailed(id: string, error: string): Promise<void> {
    await this.prisma.outboxEvent.update({
      where: { id },
      data: {
        attempts: { increment: 1 },
        lastError: error,
        status: 'PENDING',
      },
    });
  }

  async markFailedPermanent(id: string, error: string): Promise<void> {
    await this.prisma.outboxEvent.update({
      where: { id },
      data: {
        status: 'FAILED',
        lastError: error,
      },
    });
  }

  calculateRetryDelay(attempts: number): number {
    return this.baseRetryDelayMs * Math.pow(2, attempts);
  }
}
