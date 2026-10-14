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
import { CreateAllergyRequestDto, AllergyResponseDto } from '../dto';
import {
  CreateAllergyUseCase,
  RemoveAllergyUseCase,
  GetAllergiesUseCase,
} from '../../application/use-cases';

@Controller('allergies')
export class AllergiesController {
  constructor(
    private readonly createUseCase: CreateAllergyUseCase,
    private readonly removeUseCase: RemoveAllergyUseCase,
    private readonly getAllUseCase: GetAllergiesUseCase,
  ) {}

  @Post()
  async create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateAllergyRequestDto,
  ): Promise<AllergyResponseDto> {
    return this.createUseCase.execute({
      userId: user.id,
      name: dto.name,
      severity: dto.severity,
      notes: dto.notes,
    });
  }

  @Get()
  async findAll(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<AllergyResponseDto[]> {
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