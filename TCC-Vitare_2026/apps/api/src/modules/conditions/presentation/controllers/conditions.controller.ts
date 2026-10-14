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
import { CreateConditionRequestDto, ConditionResponseDto } from './presentation/dto/condition.dto';
import {
  CreateConditionUseCase,
  RemoveConditionUseCase,
  GetConditionsUseCase,
} from '../../application/use-cases';

@Controller('conditions')
export class ConditionsController {
  constructor(
    private readonly createUseCase: CreateConditionUseCase,
    private readonly removeUseCase: RemoveConditionUseCase,
    private readonly getAllUseCase: GetConditionsUseCase,
  ) {}

  @Post()
  async create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateConditionRequestDto,
  ): Promise<ConditionResponseDto> {
    return this.createUseCase.execute({
      userId: user.id,
      diseaseId: dto.diseaseId,
      notes: dto.notes,
      diagnosedAt: dto.diagnosedAt,
    });
  }

  @Get()
  async findAll(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<ConditionResponseDto[]> {
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