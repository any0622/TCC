import { IsDateString, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateMedicationDto {
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
