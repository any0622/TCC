/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable } from '@nestjs/common';
import { EmergencyContact } from '../../../../generated/prisma/client';
import { PrismaService } from '../../../infra/prisma/prisma.service';
import { ContactsRepository } from './contacts.repository';

@Injectable()
export class PrismaContactsRepository implements ContactsRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAllByUser(userId: string): Promise<EmergencyContact[]> {
    return this.prisma.emergencyContact.findMany({
      where: { userId },
      orderBy: { isPrimary: 'desc' },
    });
  }

  findById(id: string): Promise<EmergencyContact | null> {
    return this.prisma.emergencyContact.findUnique({ where: { id } });
  }

  create(userId: string, data: any): Promise<EmergencyContact> {
    return this.prisma.emergencyContact.create({ data: { ...data, userId } });
  }

  async remove(id: string): Promise<void> {
    await this.prisma.emergencyContact.delete({ where: { id } });
  }
}
