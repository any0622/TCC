import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infra/prisma/prisma.service';
import {
  DiseaseDictionaryRepository,
  DiseaseSearchResult,
} from './disease-dictionary.repository';

const MAX_RESULTS = 20;

interface RangeGroup {
  start_code: string;
  end_code: string;
  name: string;
}

@Injectable()
export class PrismaDiseaseDictionaryRepository implements DiseaseDictionaryRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Busca doenças por nome/código (até 20 resultados) e resolve o grupo de
   * cada uma por faixa de código, em uma única query adicional à tabela de
   * grupos (275 linhas, estática) — O(1) round-trip extra, independentemente
   * de quantos resultados de doença a busca retornar. Evita N+1 ao não
   * consultar disease_groups uma vez por doença encontrada.
   */
  async search(query: string): Promise<DiseaseSearchResult[]> {
    const [diseases, groups] = await Promise.all([
      this.prisma.diseaseDictionary.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { code: { contains: query, mode: 'insensitive' } },
          ],
        },
        take: MAX_RESULTS,
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
      groupName: resolveGroupName(disease.code, groups),
    }));
  }

  async findById(id: string): Promise<DiseaseSearchResult | null> {
    const disease = await this.prisma.diseaseDictionary.findUnique({
      where: { id },
    });
    if (!disease) return null;

    const groups = await this.prisma.diseaseGroup.findMany({
      select: { start_code: true, end_code: true, name: true },
    });

    return {
      id: disease.id,
      code: disease.code,
      name: disease.name,
      groupName: resolveGroupName(disease.code, groups),
    };
  }
}

/**
 * Resolve o nome do grupo (bloco CID-10) a partir da faixa de código.
 * Comparação lexicográfica sobre os 3 primeiros caracteres é suficiente:
 * os 12.451 códigos de CID.json têm 3 ou 4 caracteres sem ponto (ex.:
 * "E110"), e as 275 faixas de cid_grupos.json são delimitadas exatamente
 * nesse n�vel de 3 caracteres (ex.: "E10"–"E14").
 */
function resolveGroupName(code: string, groups: RangeGroup[]): string | null {
  const categoryCode = code.slice(0, 3).toUpperCase();
  const match = groups.find(
    (g) => categoryCode >= g.start_code && categoryCode <= g.end_code,
  );
  return match?.name ?? null;
}
