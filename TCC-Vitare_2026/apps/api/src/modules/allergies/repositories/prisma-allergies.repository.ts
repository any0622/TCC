import { Injectable } from '@nestjs/common';
import { Allergy } from '../../../../generated/prisma/client';
import { PrismaService } from '../../../infra/prisma/prisma.service';
import { AllergiesRepository } from './allergies.repository';

@Injectable()
export class PrismaAllergiesRepository implements AllergiesRepository {
  constructor(private readonly prisma: PrismaService) {}

  /** O(k) via �ndice em userId; sem filtro de status, já que não há soft delete */
  findAllByUser(userId: string): Promise<Allergy[]> {
    return this.prisma.allergy.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  findById(id: string): Promise<Allergy | null> {
    return this.prisma.allergy.findUnique({ where: { id } });
  }

  create(
    userId: string,
    data: { name: string; severity?: string; notes?: string },
  ): Promise<Allergy> {
    return this.prisma.allergy.create({ data: { ...data, userId } });
  }

  async remove(id: string): Promise<void> {
    await this.prisma.allergy.delete({ where: { id } });
  }
}
