import { IsDateString, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateConditionRequestDto {
  @IsUUID()
  diseaseId!: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsDateString()
  diagnosedAt?: string;
}

export class ConditionResponseDto {
  id!: string;
  userId!: string;
  diseaseId!: string;
  disease!: {
    id: string;
    code: string;
    name: string;
  };
  notes!: string | null;
  diagnosedAt!: Date | null;
  isActive!: boolean;
  createdAt!: Date;
}