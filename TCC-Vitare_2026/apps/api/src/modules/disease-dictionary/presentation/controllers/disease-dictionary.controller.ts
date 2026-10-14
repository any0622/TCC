import { Controller, Get, Query } from '@nestjs/common';
import { SearchDiseaseRequestDto, DiseaseSearchResultResponseDto } from './presentation/dto/disease-dictionary.dto';
import type { SearchDiseasesUseCase, FindDiseaseByIdUseCase } from '../../application/use-cases';

@Controller('disease-dictionary')
export class DiseaseDictionaryController {
  constructor(
    private readonly searchUseCase: SearchDiseasesUseCase,
    private readonly findByIdUseCase: FindDiseaseByIdUseCase,
  ) {}

  @Get()
  async search(
    @Query() query: SearchDiseaseRequestDto,
  ): Promise<DiseaseSearchResultResponseDto[]> {
    return this.searchUseCase.execute({ query: query.search });
  }
}