/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, NotFoundException } from '@nestjs/common';
import { UpdatePatientDto } from '../patients/dto/update-patients.dto';
import { PatientsRepository } from './repositories/patients.repository';

@Injectable()
export class PatientsService {
  constructor(private readonly repository: PatientsRepository) {}

  async getProfile(userId: string) {
    const user = await this.repository.findById(userId);
    if (!user) throw new NotFoundException('Paciente não encontrado');
    const { passwordHash: _omit, ...safe } = user;
    return safe;
  }

  async updateProfile(userId: string, dto: UpdatePatientDto) {
    const updated = await this.repository.update(userId, {
      ...dto,
      birthDate: dto.birthDate ? new Date(dto.birthDate) : undefined,
      weightKg: dto.weightKg as any,
    });
    const { passwordHash: _omit, ...safe } = updated;
    return safe;
  }

  async deleteAccount(userId: string): Promise<void> {
    const user = await this.repository.findById(userId);
    if (!user) throw new NotFoundException('Paciente não encontrado');
    await this.repository.remove(userId);
  }
}
