import {
  IsDateString,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateMedicationRequestDto {
  @IsString()
  @MaxLength(255)
  name!: string;

  @IsString()
  @MaxLength(100)
  dosage!: string;

  @IsString()
  @MaxLength(100)
  frequency!: string;

  @IsDateString()
  startDate!: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateMedicationRequestDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  dosage?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  frequency?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  isActive?: boolean;
}

export class MedicationResponseDto {
  id!: string;
  userId!: string;
  name!: string;
  dosage!: string;
  frequency!: string;
  startDate!: Date;
  endDate!: Date | null;
  notes!: string | null;
  isActive!: boolean;
  createdAt!: Date;
  updatedAt!: Date;
}

export class MedicationHistoryResponseDto {
  id!: string;
  medicationId!: string;
  userId!: string;
  changedAt!: Date;
  changedField!: string;
  oldValue!: string | null;
  newValue!: string | null;
}