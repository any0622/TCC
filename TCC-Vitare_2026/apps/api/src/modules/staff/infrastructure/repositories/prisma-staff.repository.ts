import { Injectable } from '@nestjs/common';
import type { PrismaService } from '../../../../infra/prisma/prisma.service';
import { StaffRepositoryPort } from '../../application/ports';
import { Staff } from '../../domain/entities/staff.entity';

@Injectable()
export class PrismaStaffRepository implements StaffRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async findByEmail(email: string): Promise<Staff | null> {
    const staff = await this.prisma.staff.findUnique({ where: { email } });
    return staff ? this.toDomain(staff) : null;
  }

  async findById(id: string): Promise<Staff | null> {
    const staff = await this.prisma.staff.findUnique({ where: { id } });
    return staff ? this.toDomain(staff) : null;
  }

  async findAny(): Promise<Staff | null> {
    const staff = await this.prisma.staff.findFirst();
    return staff ? this.toDomain(staff) : null;
  }

  async save(staff: Staff): Promise<Staff> {
    const data = staff.toPersistence();
    const saved = await this.prisma.staff.upsert({
      where: { id: data.id },
      create: data,
      update: data,
    });
    return this.toDomain(saved);
  }

  private toDomain(prismaStaff: any): Staff {
    return Staff.reconstruct({
      id: prismaStaff.id,
      fullName: prismaStaff.fullName,
      email: prismaStaff.email,
      cpf: prismaStaff.cpf,
      registrationNumber: prismaStaff.registrationNumber,
      role: prismaStaff.role,
      passwordHash: prismaStaff.passwordHash,
      createdAt: prismaStaff.createdAt,
      updatedAt: prismaStaff.updatedAt,
    });
  }
}