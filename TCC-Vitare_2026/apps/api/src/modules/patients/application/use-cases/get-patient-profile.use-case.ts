import { Injectable } from '@nestjs/common';
import type { PatientRepositoryPort } from '../ports';
import { GetPatientProfileQuery, PatientProfileResult } from '../dto/patient.dto';
import { PatientNotFoundException } from '../../domain/exceptions';

@Injectable()
export class GetPatientProfileUseCase {
  constructor(private readonly patientRepository: PatientRepositoryPort) {}

  async execute(query: GetPatientProfileQuery): Promise<PatientProfileResult> {
    const profile = await this.patientRepository.findById(query.userId);
    if (!profile) {
      throw new PatientNotFoundException(query.userId);
    }
    return this.toResult(profile);
  }

  private toResult(profile: PatientProfile): PatientProfileResult {
    return {
      id: profile.id,
      fullName: profile.fullName,
      email: profile.email,
      cpf: profile.cpf,
      phone: profile.phone,
      address: profile.address,
      birthDate: profile.birthDate,
      bloodType: profile.bloodType,
      weightKg: profile.weightKg,
      heightCm: profile.heightCm,
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
    };
  }
}