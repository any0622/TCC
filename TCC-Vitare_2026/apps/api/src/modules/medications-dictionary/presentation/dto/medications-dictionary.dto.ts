import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class SearchMedicationRequestDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  search?: string;
}

export class MedicationSearchResultResponseDto {
  id!: string;
  nome!: string;
  laboratorio!: string;
  substancias!: string[];
  apresentacoes!: string[];
  tarjas!: string[];
}