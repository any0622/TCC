import { Injectable } from '@nestjs/common';
import { EmergencyEvent } from '../../../../generated/prisma/client';
import { PrismaService } from '../../../infra/prisma/prisma.service';
import {
  EmergencyFeedRepository,
  StaffEmergencyFeedItem,
} from './emergency-feed.repository';

type SnapshotPatient = {
  [key: string]: unknown;
  cpf?: unknown;
};

type SnapshotObject = {
  [key: string]: unknown;
  patient?: SnapshotPatient;
};

function asSnapshotObject(value: unknown): SnapshotObject {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return {};
  }

  return value as SnapshotObject;
}

@Injectable()
export class PrismaEmergencyFeedRepository implements EmergencyFeedRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Sem escopo de userId: esta consulta pertence ao módulo operacional da
   * equipe de resposta e pode visualizar emergências de todos os pacientes.
   *
   * O CPF é preferencialmente lido do patientSnapshot, pois esse é o estado
   * capturado no momento do acionamento. Para eventos históricos criados antes
   * da inclusão do CPF no snapshot, usamos o CPF atual do usuário como
   * compatibilidade de leitura. Assim, registros antigos não ficam sem o
   * identificador operacional necessário para a busca do prontuário.
   */
  async findRecent(limit: number): Promise<StaffEmergencyFeedItem[]> {
    const events = await this.prisma.emergencyEvent.findMany({
      orderBy: { triggeredAt: 'desc' },
      take: limit,
      include: {
        user: {
          select: {
            cpf: true,
          },
        },
      },
    });

    return events.map(({ user, ...event }) => {
      const snapshot = asSnapshotObject(event.patientSnapshot);
      const patient = snapshot.patient ?? {};

      return {
        ...event,
        patientSnapshot: {
          ...snapshot,
          patient: {
            ...patient,
            cpf:
              typeof patient.cpf === 'string' && patient.cpf.trim().length > 0
                ? patient.cpf
                : (user.cpf ?? null),
          },
        },
      } as StaffEmergencyFeedItem;
    });
  }
}
