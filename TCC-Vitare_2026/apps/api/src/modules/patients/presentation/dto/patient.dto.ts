import {
  IsDateString,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  Min,
} from 'class-validator';

import { BLOOD_TYPES, type BloodType } from '../../../../common/constants/blood-types';

const CPF_PATTERN = /^\d{3}\.?\d{3}\.?\d{3}-?\d{2}$/;
const PHONE_PATTERN = /^\(\d{2}\) \d{4,5}-\d{4}$/;

export class UpdatePatientProfileRequestDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  fullName?: string;

  @IsOptional()
  @IsDateString()
  birthDate?: string;

  @IsOptional()
  @IsString()
  @IsIn([...BLOOD_TYPES], {
    message: 'Tipo sanguíneo inválido. Use A+, A-, B+, B-, AB+, AB-, O+ ou O-.',
  })
  @MaxLength(5)
  bloodType?: BloodType;

  @IsOptional()
  @Min(0)
  weightKg?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  heightCm?: number;

  @IsOptional()
  @IsString()
  @Matches(CPF_PATTERN, {
    message: 'CPF deve conter 11 dígitos, com ou sem máscara',
  })
  cpf?: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  @Matches(PHONE_PATTERN, {
    message: 'Telefone deve estar no formato (11) 1234-5678 ou (11) 91234-5678',
  })
  phone?: string;

  @IsOptional()
  @IsString()
  address?: string;
}

export class PatientProfileResponseDto {
  id!: string;
  fullName!: string;
  email!: string;
  cpf!: string | null;
  phone!: string | null;
  address!: string | null;
  birthDate!: Date | null;
  bloodType!: string | null;
  weightKg!: number | null;
  heightCm!: number | null;
  createdAt!: Date;
  updatedAt!: Date;
}