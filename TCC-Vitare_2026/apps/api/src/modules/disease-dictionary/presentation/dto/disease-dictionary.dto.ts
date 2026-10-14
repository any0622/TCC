import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class SearchDiseaseRequestDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  search?: string;
}

export class DiseaseSearchResultResponseDto {
  id!: string;
  code!: string;
  name!: string;
  groupName!: string | null;
}