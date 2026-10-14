import { Injectable } from '@nestjs/common';
import type { PrismaService } from '../../../../infra/prisma/prisma.service';
import { EmergencyRepositoryPort } from '../../application/ports';
import { EmergencyEvent } from '../../domain/entities/emergency-event.entity';
import { PatientSnapshot } from '../../domain/entities/emergency-event.entity';

@Injectable()
export class PrismaEmergencyRepository implements EmergencyRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async trigger(data: {
    userId: string;
    latitude?: number;
    longitude?: number;
  }): Promise<EmergencyEvent> {
    return this.prisma.$transaction(async (tx) => {
      const user = await tx.user.findUniqueOrThrow({
        where: { id: data.userId },
        include: {
          conditions: {
            where: { isActive: true },
            include: { disease: true },
          },
          medications: { where: { isActive: true } },
          contacts: { orderBy: { isPrimary: 'desc' } },
          allergies: true,
        },
      });

      const snapshot: PatientSnapshot = {
        patient: {
          fullName: user.fullName,
          cpf: user.cpf,
          bloodType: user.bloodType,
          birthDate: user.birthDate?.toISOString() ?? null,
          weightKg: user.weightKg ? Number(user.weightKg) : null,
          heightCm: user.heightCm,
        },
        conditions: user.conditions.map((c) => ({
          name: c.disease.name,
          code: c.disease.code,
        })),
        medications: user.medications.map((m) => ({
          name: m.name,
          dosage: m.dosage,
          frequency: m.frequency,
        })),
        contacts: user.contacts.map((c) => ({
          name: c.name,
          phone: c.phone,
          isPrimary: c.isPrimary,
        })),
        allergies: user.allergies.map((a) => ({
          name: a.name,
          severity: a.severity,
          notes: a.notes,
        })),
        capturedAt: new Date().toISOString(),
      };

      const created = await tx.emergencyEvent.create({
        data: {
          userId: data.userId,
          latitude: data.latitude,
          longitude: data.longitude,
          patientSnapshot: snapshot as any,
          status: 'TRIGGERED',
        },
      });

      return EmergencyEvent.reconstruct({
        id: created.id,
        userId: created.userId,
        triggeredAt: created.triggeredAt,
        latitude: created.latitude ? Number(created.latitude) : null,
        longitude: created.longitude ? Number(created.longitude) : null,
        patientSnapshot: created.patientSnapshot as unknown as PatientSnapshot,
        status: created.status,
        notes: created.notes,
      });
    });
  }

  async findAllByUser(userId: string): Promise<EmergencyEvent[]> {
    const events = await this.prisma.emergencyEvent.findMany({
      where: { userId },
      orderBy: { triggeredAt: 'desc' },
    });
    return events.map(this.toDomain);
  }

  async findByUserWithCursor(
    userId: string,
    options: { cursor?: string; limit: number },
  ): Promise<{
    data: EmergencyEvent[];
    nextCursor: string | null;
    hasMore: boolean;
  }> {
    const { cursor, limit } = options;
    const maxLimit = Math.min(limit, 50);

    const where: any = { userId };

    if (cursor) {
      try {
        const [cursorTimestamp, cursorId] = cursor.split('_');
        where.triggeredAt = { lt: new Date(cursorTimestamp) };
        where.id = { not: cursorId };
      } catch {
        throw new Error('Cursor inválido');
      }
    }

    const events = await this.prisma.emergencyEvent.findMany({
      where,
      orderBy: [{ triggeredAt: 'desc' }, { id: 'desc' }],
      take: maxLimit + 1,
    });

    const hasMore = events.length > maxLimit;
    const data = hasMore ? events.slice(0, maxLimit) : events;

    let nextCursor: string | null = null;
    if (hasMore && data.length > 0) {
      const lastEvent = data[data.length - 1];
      nextCursor = `${lastEvent.triggeredAt.toISOString()}_${lastEvent.id}`;
    }

    return {
      data: data.map(this.toDomain),
      nextCursor,
      hasMore,
    };
  }

  private toDomain(prismaEvent: any): EmergencyEvent {
    return EmergencyEvent.reconstruct({
      id: prismaEvent.id,
      userId: prismaEvent.userId,
      triggeredAt: prismaEvent.triggeredAt,
      latitude: prismaEvent.latitude ? Number(prismaEvent.latitude) : null,
      longitude: prismaEvent.longitude ? Number(prismaEvent.longitude) : null,
      patientSnapshot: prismaEvent.patientSnapshot as unknown as PatientSnapshot,
      status: prismaEvent.status,
      notes: prismaEvent.notes,
    });
  }
}