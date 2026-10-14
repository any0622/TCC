import { Controller, Get, Query } from '@nestjs/common';
import type { SearchMedicationRequestDto, MedicationSearchResultResponseDto } from '../dto';
import type { SearchMedicationsUseCase, FindMedicationByIdUseCase } from '../../application/use-cases';

@Controller('medications-dictionary')
export class MedicationsDictionaryController {
  constructor(
    private readonly searchUseCase: SearchMedicationsUseCase,
    private readonly findByIdUseCase: FindMedicationByIdUseCase,
  ) {}

  @Get()
  async search(
    @Query() query: SearchMedicationRequestDto,
  ): Promise<MedicationSearchResultResponseDto[]> {
    return this.searchUseCase.execute({ query: query.search });
  }
}