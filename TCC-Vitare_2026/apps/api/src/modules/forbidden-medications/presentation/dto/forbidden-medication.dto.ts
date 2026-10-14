import { IsString, IsUUID, MaxLength } from 'class-validator';

export class CreateForbiddenMedicationRequestDto {
  @IsUUID()
  medicationsDictionaryId!: string;

  @IsString()
  @MaxLength(500)
  reason!: string;
}

export class ForbiddenMedicationResponseDto {
  id!: string;
  userId!: string;
  medicationsDictionaryId!: string;
  reason!: string;
  createdAt!: Date;
  medication!: {
    id: string;
    nome: string;
    laboratorio: string;
    substancias: string[];
    apresentacoes: string[];
    tarjas: string[];
  };
}