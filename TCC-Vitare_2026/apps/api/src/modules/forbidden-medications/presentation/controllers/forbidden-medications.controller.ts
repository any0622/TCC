import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../../../../common/decorators/current-user.decorator';
import type { CreateForbiddenMedicationRequestDto, ForbiddenMedicationResponseDto } from '../dto';
import {
  CreateForbiddenMedicationUseCase,
  RemoveForbiddenMedicationUseCase,
  GetForbiddenMedicationsUseCase,
} from '../../application/use-cases';

@Controller('forbidden-medications')
export class ForbiddenMedicationsController {
  constructor(
    private readonly createUseCase: CreateForbiddenMedicationUseCase,
    private readonly removeUseCase: RemoveForbiddenMedicationUseCase,
    private readonly getAllUseCase: GetForbiddenMedicationsUseCase,
  ) {}

  @Post()
  async create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateForbiddenMedicationRequestDto,
  ): Promise<ForbiddenMedicationResponseDto> {
    return this.createUseCase.execute({
      userId: user.id,
      medicationsDictionaryId: dto.medicationsDictionaryId,
      reason: dto.reason,
    });
  }

  @Get()
  async findAll(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<ForbiddenMedicationResponseDto[]> {
    return this.getAllUseCase.execute({ userId: user.id });
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ): Promise<void> {
    await this.removeUseCase.execute({ id, userId: user.id });
  }
}