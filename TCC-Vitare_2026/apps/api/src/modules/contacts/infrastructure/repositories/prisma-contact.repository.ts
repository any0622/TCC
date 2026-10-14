import { Injectable } from '@nestjs/common';
import type { PrismaService } from '../../../../infra/prisma/prisma.service';
import { ContactRepositoryPort } from '../../application/ports';
import { EmergencyContact } from '../../domain/entities/contact.entity';

@Injectable()
export class PrismaContactRepository implements ContactRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async findAllByUser(userId: string): Promise<EmergencyContact[]> {
    const contacts = await this.prisma.emergencyContact.findMany({
      where: { userId },
      orderBy: { isPrimary: 'desc' },
    });
    return contacts.map(this.toDomain);
  }

  async findById(id: string): Promise<EmergencyContact | null> {
    const contact = await this.prisma.emergencyContact.findUnique({ where: { id } });
    return contact ? this.toDomain(contact) : null;
  }

  async save(contact: EmergencyContact): Promise<EmergencyContact> {
    const data = contact.toPersistence();
    const saved = await this.prisma.emergencyContact.create({ data });
    return this.toDomain(saved);
  }

  async remove(id: string): Promise<void> {
    await this.prisma.emergencyContact.delete({ where: { id } });
  }

  private toDomain(prismaContact: any): EmergencyContact {
    return EmergencyContact.reconstruct({
      id: prismaContact.id,
      userId: prismaContact.userId,
      name: prismaContact.name,
      phone: prismaContact.phone,
      relationship: prismaContact.relationship,
      isPrimary: prismaContact.isPrimary,
      createdAt: prismaContact.createdAt,
    });
  }
}