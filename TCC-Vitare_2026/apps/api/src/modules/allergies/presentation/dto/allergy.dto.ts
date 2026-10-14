import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateAllergyRequestDto {
  @IsString()
  @MaxLength(255)
  name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  severity?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class AllergyResponseDto {
  id!: string;
  userId!: string;
  name!: string;
  severity!: string | null;
  notes!: string | null;
  createdAt!: Date;
}