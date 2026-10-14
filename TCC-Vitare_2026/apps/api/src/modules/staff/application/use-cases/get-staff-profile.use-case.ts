import { Injectable } from '@nestjs/common';
import type { StaffRepositoryPort } from '../ports';
import { GetStaffProfileQuery, StaffTokenResult } from '../dto/staff.dto';
import { StaffNotFoundException } from '../../domain/exceptions';

@Injectable()
export class GetStaffProfileUseCase {
  constructor(private readonly staffRepository: StaffRepositoryPort) {}

  async execute(query: GetStaffProfileQuery): Promise<StaffTokenResult['staff']> {
    const staff = await this.staffRepository.findById(query.staffId);
    if (!staff) throw new StaffNotFoundException(query.staffId);
    return {
      id: staff.id,
      fullName: staff.fullName,
      email: staff.email,
      cpf: staff.cpf,
      registrationNumber: staff.registrationNumber,
      role: staff.role,
    };
  }
}