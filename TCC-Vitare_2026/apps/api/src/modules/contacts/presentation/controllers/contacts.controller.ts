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
import { CreateContactRequestDto, ContactResponseDto } from './presentation/dto/contact.dto';
import {
  CreateContactUseCase,
  RemoveContactUseCase,
  GetContactsUseCase,
} from '../../application/use-cases';

@Controller('contacts')
export class ContactsController {
  constructor(
    private readonly createUseCase: CreateContactUseCase,
    private readonly removeUseCase: RemoveContactUseCase,
    private readonly getAllUseCase: GetContactsUseCase,
  ) {}

  @Post()
  async create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateContactRequestDto,
  ): Promise<ContactResponseDto> {
    return this.createUseCase.execute({
      userId: user.id,
      name: dto.name,
      phone: dto.phone,
      relationship: dto.relationship,
      isPrimary: dto.isPrimary,
    });
  }

  @Get()
  async findAll(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<ContactResponseDto[]> {
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