import { Injectable } from '@nestjs/common';
import type { PatientRepositoryPort } from '../ports';
import { UpdatePatientProfileCommand, PatientProfileResult } from '../dto/patient.dto';
import { PatientProfile } from '../../domain/entities/patient-profile.entity';
import { BloodType, Weight, Height } from '../../domain/value-objects';
import { PatientNotFoundException, InvalidPatientDataException } from '../../domain/exceptions';

@Injectable()
export class UpdatePatientProfileUseCase {
  constructor(private readonly patientRepository: PatientRepositoryPort) {}

  async execute(command: UpdatePatientProfileCommand): Promise<PatientProfileResult> {
    const profile = await this.patientRepository.findById(command.userId);
    if (!profile) {
      throw new PatientNotFoundException(command.userId);
    }

    const updateData: Partial<{
      fullName: string;
      birthDate: Date | null;
      bloodType: string | null;
      weightKg: number | null;
      heightCm: number | null;
      cpf: string | null;
      phone: string | null;
      address: string | null;
    }> = {};

    if (command.fullName !== undefined) updateData.fullName = command.fullName;
    if (command.birthDate !== undefined) updateData.birthDate = command.birthDate ? new Date(command.birthDate) : null;
    if (command.bloodType !== undefined) {
      if (command.bloodType) {
        BloodType.create(command.bloodType);
      }
      updateData.bloodType = command.bloodType;
    }
    if (command.weightKg !== undefined) {
      if (command.weightKg !== null) {
        Weight.create(command.weightKg);
      }
      updateData.weightKg = command.weightKg;
    }
    if (command.heightCm !== undefined) {
      if (command.heightCm !== null) {
        Height.create(command.heightCm);
      }
      updateData.heightCm = command.heightCm;
    }
    if (command.cpf !== undefined) updateData.cpf = command.cpf;
    if (command.phone !== undefined) updateData.phone = command.phone;
    if (command.address !== undefined) updateData.address = command.address;

    const updatedProfile = profile.update(updateData);
    const savedProfile = await this.patientRepository.save(updatedProfile);

    return this.toResult(savedProfile);
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