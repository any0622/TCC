/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable } from '@nestjs/common';
import { EmergencyEvent } from '../../../../generated/prisma/client';
import { PrismaService } from '../../../infra/prisma/prisma.service';
import {
  EmergencyRepository,
  PatientSnapshot,
  CursorPaginationOptions,
  CursorPaginatedResult,
} from './emergency.repository';

@Injectable()
export class PrismaEmergencyRepository implements EmergencyRepository {
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

      return tx.emergencyEvent.create({
        data: {
          userId: data.userId,
          latitude: data.latitude,
          longitude: data.longitude,
          patientSnapshot: snapshot as any,
          status: 'TRIGGERED',
        },
      });
    });
  }

  findAllByUser(userId: string): Promise<EmergencyEvent[]> {
    return this.prisma.emergencyEvent.findMany({
      where: { userId },
      orderBy: { triggeredAt: 'desc' },
    });
  }

  async findByUserWithCursor(
    userId: string,
    options: CursorPaginationOptions,
  ): Promise<CursorPaginatedResult<EmergencyEvent>> {
    const { cursor, limit } = options;
    const maxLimit = Math.min(limit, 50);

    const where: any = { userId };

    if (cursor) {
      try {
        const [cursorTimestamp, cursorId] = cursor.split('_');
        where.triggeredAt = {
          lt: new Date(cursorTimestamp),
        };
        where.id = {
          not: cursorId,
        };
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

    return { data, nextCursor, hasMore };
  }
}
