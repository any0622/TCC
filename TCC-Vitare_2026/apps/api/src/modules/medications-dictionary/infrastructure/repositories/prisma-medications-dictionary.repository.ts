import { Injectable } from '@nestjs/common';
import type { PrismaService } from '../../../../infra/prisma/prisma.service';
import { MedicationsDictionaryRepositoryPort } from '../../application/ports';
import { MedicationSearchResult } from '../../domain/repositories';

@Injectable()
export class PrismaMedicationsDictionaryRepository implements MedicationsDictionaryRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async search(query: string): Promise<MedicationSearchResult[]> {
    return this.prisma.medicationsDictionary.findMany({
      where: { nome: { contains: query, mode: 'insensitive' } },
      take: 20,
      orderBy: { nome: 'asc' },
    });
  }

  async findById(id: string): Promise<MedicationSearchResult | null> {
    return this.prisma.medicationsDictionary.findUnique({ where: { id } });
  }
}