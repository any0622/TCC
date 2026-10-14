import { Injectable } from '@nestjs/common';
import type { PrismaService } from '../../../../infra/prisma/prisma.service';
import { DiseaseDictionaryRepositoryPort } from '../../application/ports';
import { DiseaseSearchResult } from '../../domain/repositories';

@Injectable()
export class PrismaDiseaseDictionaryRepository implements DiseaseDictionaryRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async search(query: string): Promise<DiseaseSearchResult[]> {
    const [diseases, groups] = await Promise.all([
      this.prisma.diseaseDictionary.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { code: { contains: query, mode: 'insensitive' } },
          ],
        },
        take: 20,
        orderBy: { name: 'asc' },
      }),
      this.prisma.diseaseGroup.findMany({
        select: { start_code: true, end_code: true, name: true },
      }),
    ]);

    return diseases.map((disease) => ({
      id: disease.id,
      code: disease.code,
      name: disease.name,
      groupName: this.resolveGroupName(disease.code, groups),
    }));
  }

  async findById(id: string): Promise<DiseaseSearchResult | null> {
    const disease = await this.prisma.diseaseDictionary.findUnique({ where: { id } });
    if (!disease) return null;

    const groups = await this.prisma.diseaseGroup.findMany({
      select: { start_code: true, end_code: true, name: true },
    });

    return {
      id: disease.id,
      code: disease.code,
      name: disease.name,
      groupName: this.resolveGroupName(disease.code, groups),
    });
  }

  private resolveGroupName(code: string, groups: Array<{ start_code: string; end_code: string; name: string }>): string | null {
    const categoryCode = code.slice(0, 3).toUpperCase();
    const match = groups.find((g) => categoryCode >= g.start_code && categoryCode <= g.end_code);
    return match?.name ?? null;
  }
}