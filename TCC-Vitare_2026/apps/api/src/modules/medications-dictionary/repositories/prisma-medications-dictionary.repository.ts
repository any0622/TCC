import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infra/prisma/prisma.service';
import {
  MedicationsDictionaryRepository,
  MedicationSearchResult,
} from './medications-dictionary.repository';

const MAX_RESULTS = 20;

@Injectable()
export class PrismaMedicationsDictionaryRepository implements MedicationsDictionaryRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Busca por nome do produto, case-insensitive, limitada a 20 resultados.
   * Índice em `nome` acelera o filtro `contains`. Diferente de
   * DiseaseDictionary, não há resolução de grupo por faixa aqui — cada
   * registro já carrega todos os dados de que o autocomplete precisa
   * (substâncias, apresentações, tarjas), então uma única query resolve
   * completamente a busca sem round-trip adicional.
   */
  search(query: string): Promise<MedicationSearchResult[]> {
    return this.prisma.medicationsDictionary.findMany({
      where: { nome: { contains: query, mode: 'insensitive' } },
      take: MAX_RESULTS,
      orderBy: { nome: 'asc' },
    });
  }

  findById(id: string): Promise<MedicationSearchResult | null> {
    return this.prisma.medicationsDictionary.findUnique({ where: { id } });
  }
}
