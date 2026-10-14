import { Injectable } from '@nestjs/common';
import { User } from '../../../../generated/prisma/client';
import { PrismaService } from '../../../infra/prisma/prisma.service';
import { PatientsRepository } from './patients.repository';

@Injectable()
export class PrismaPatientsRepository implements PatientsRepository {
  constructor(private readonly prisma: PrismaService) {}

  findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }

  update(id: string, data: Partial<User>): Promise<User> {
    return this.prisma.user.update({ where: { id }, data });
  }

  /**
   * O DELETE em `users` dispara ON DELETE CASCADE em todas as tabelas
   * filhas (conditions, medications, contacts, allergies, emergency_events,
   * refresh_tokens, password_reset_tokens) — uma única operação SQL,
   * sem necessidade de deletar cada relação manualmente antes.
   */
  async remove(id: string): Promise<void> {
    await this.prisma.user.delete({ where: { id } });
  }
}
