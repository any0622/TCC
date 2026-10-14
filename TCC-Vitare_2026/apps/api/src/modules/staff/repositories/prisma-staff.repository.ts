import { Injectable } from '@nestjs/common';
import { Staff, StaffRole } from '../../../../generated/prisma/client';
import { PrismaService } from '../../../infra/prisma/prisma.service';
import { StaffRepository } from './staff.repository';

@Injectable()
export class PrismaStaffRepository implements StaffRepository {
  constructor(private readonly prisma: PrismaService) {}

  findByEmail(email: string): Promise<Staff | null> {
    return this.prisma.staff.findUnique({ where: { email } });
  }

  findById(id: string): Promise<Staff | null> {
    return this.prisma.staff.findUnique({ where: { id } });
  }

  findAny(): Promise<Staff | null> {
    return this.prisma.staff.findFirst();
  }

  create(data: {
    fullName: string;
    email: string;
    cpf: string;
    registrationNumber: string;
    role: string;
    passwordHash: string;
  }): Promise<Staff> {
    return this.prisma.staff.create({
      data: {
        ...data,
        role: data.role as StaffRole,
      },
    });
  }
}
