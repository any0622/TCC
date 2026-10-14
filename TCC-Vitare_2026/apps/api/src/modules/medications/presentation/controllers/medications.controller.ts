import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../../../../common/decorators/current-user.decorator';
import {
  CreateMedicationRequestDto,
  UpdateMedicationRequestDto,
  MedicationResponseDto,
  MedicationHistoryResponseDto,
} from './presentation/dto/medication.dto';
import {
  CreateMedicationUseCase,
  UpdateMedicationUseCase,
  DeleteMedicationUseCase,
  GetActiveMedicationsUseCase,
  GetMedicationHistoryUseCase,
} from '../../application/use-cases';

@Controller('medications')
export class MedicationsController {
  constructor(
    private readonly createUseCase: CreateMedicationUseCase,
    private readonly updateUseCase: UpdateMedicationUseCase,
    private readonly deleteUseCase: DeleteMedicationUseCase,
    private readonly getAllUseCase: GetActiveMedicationsUseCase,
    private readonly getHistoryUseCase: GetMedicationHistoryUseCase,
  ) {}

  @Post()
  async create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateMedicationRequestDto,
  ): Promise<MedicationResponseDto> {
    return this.createUseCase.execute({
      userId: user.id,
      name: dto.name,
      dosage: dto.dosage,
      frequency: dto.frequency,
      startDate: dto.startDate,
      endDate: dto.endDate ?? null,
      notes: dto.notes,
    });
  }

  @Get()
  async findAll(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<MedicationResponseDto[]> {
    return this.getAllUseCase.execute({ userId: user.id });
  }

  @Put(':id')
  async update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: UpdateMedicationRequestDto,
  ): Promise<MedicationResponseDto> {
    return this.updateUseCase.execute({
      id,
      userId: user.id,
      name: dto.name,
      dosage: dto.dosage,
      frequency: dto.frequency,
      startDate: dto.startDate,
      endDate: dto.endDate ?? null,
      notes: dto.notes,
      isActive: dto.isActive,
    });
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ): Promise<void> {
    await this.deleteUseCase.execute({ id, userId: user.id });
  }

  @Get(':id/history')
  async getHistory(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ): Promise<MedicationHistoryResponseDto[]> {
    return this.getHistoryUseCase.execute({ medicationId: id, userId: user.id });
  }
}