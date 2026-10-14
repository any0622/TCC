import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infra/prisma/prisma.service';
import {
  PatientFullProfile,
  PatientLookupRepository,
} from './patient-lookup.repository';

@Injectable()
export class PrismaPatientLookupRepository implements PatientLookupRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Agregação completa em uma única query relacional — mesma estratégia já
   * usada em EmergencyRepository.trigger(): um único `findUnique` com
   * múltiplos `include`, resolvido pelo query engine do Prisma como uma
   * quantidade m�nima de operações SQL, em vez de N chamadas sequenciais
   * por categoria de dado. A diferença central para as consultas do
   * próprio paciente é que aqui `medications` não é filtrado por
   * `isActive: true` — os dois estados são trazidos juntos e separados
   * em memória, porque o requisito expl�cito desta tela é expor também
   * o que está em desuso.
   */
  async findFullProfileByCpf(cpf: string): Promise<PatientFullProfile | null> {
    const user = await this.prisma.user.findUnique({
      where: { cpf },
      include: {
        conditions: {
          where: { isActive: true },
          include: { disease: true },
        },
        allergies: true,
        medications: true, // sem filtro — ativos e inativos juntos
        forbiddenMedications: {
          include: { medicationsDictionary: true },
        },
      },
    });

    if (!user) return null;

    return {
      patient: {
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        address: user.address,
        birthDate: user.birthDate?.toISOString() ?? null,
        bloodType: user.bloodType,
        weightKg: user.weightKg ? Number(user.weightKg) : null,
        heightCm: user.heightCm,
      },
      conditions: user.conditions.map((c) => ({
        name: c.disease.name,
        code: c.disease.code,
        diagnosedAt: c.diagnosedAt?.toISOString() ?? null,
        notes: c.notes,
      })),
      allergies: user.allergies.map((a) => ({
        name: a.name,
        severity: a.severity,
        notes: a.notes,
      })),
      activeMedications: user.medications
        .filter((m) => m.isActive)
        .map((m) => ({
          name: m.name,
          dosage: m.dosage,
          frequency: m.frequency,
          startDate: m.startDate.toISOString(),
        })),
      inactiveMedications: user.medications
        .filter((m) => !m.isActive)
        .map((m) => ({
          name: m.name,
          dosage: m.dosage,
          frequency: m.frequency,
          startDate: m.startDate.toISOString(),
          endDate: m.endDate?.toISOString() ?? null,
        })),
      forbiddenMedications: user.forbiddenMedications.map((f) => ({
        name: f.medicationsDictionary.nome,
        laboratorio: f.medicationsDictionary.laboratorio,
        reason: f.reason,
      })),
    };
  }
}
