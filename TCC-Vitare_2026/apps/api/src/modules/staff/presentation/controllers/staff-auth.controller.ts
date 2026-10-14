import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import type { Request } from 'express';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import type { RegisterStaffRequestDto, LoginStaffRequestDto, StaffTokenResponseDto } from '../dto';
import {
  RegisterStaffUseCase,
  LoginStaffUseCase,
  BootstrapAdminUseCase,
  GetStaffProfileUseCase,
} from '../../application/use-cases';
import { StaffJwtAuthGuard } from '../guards/staff-jwt-auth.guard';

@Controller('staff/auth')
export class StaffAuthController {
  constructor(
    private readonly registerUseCase: RegisterStaffUseCase,
    private readonly loginUseCase: LoginStaffUseCase,
    private readonly bootstrapUseCase: BootstrapAdminUseCase,
    private readonly getProfileUseCase: GetStaffProfileUseCase,
  ) {}

  @UseGuards(StaffJwtAuthGuard)
  @Get('me')
  async me(
    @CurrentUser() user: { id: string; email: string; type: string; role: string },
  ): Promise<StaffTokenResponseDto['staff']> {
    return this.getProfileUseCase.execute({ staffId: user.id });
  }

  @UseGuards(StaffJwtAuthGuard)
  @Post('register')
  async register(
    @Req() req: Request & { user: { id: string; role: string } },
    @Body() dto: RegisterStaffRequestDto,
  ): Promise<StaffTokenResponseDto> {
    if (req.user.role !== 'ADMINISTRATIVO') {
      return { accessToken: '', staff: { id: '', fullName: '', email: '', cpf: '', registrationNumber: '', role: '' } };
    }
    return this.registerUseCase.execute({
      fullName: dto.fullName,
      email: dto.email,
      cpf: dto.cpf,
      registrationNumber: dto.registrationNumber,
      password: dto.password,
    });
  }

  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Body() dto: LoginStaffRequestDto): Promise<StaffTokenResponseDto> {
    return this.loginUseCase.execute({
      email: dto.email,
      password: dto.password,
    });
  }

  @Post('bootstrap')
  async bootstrap(@Body() dto: RegisterStaffRequestDto): Promise<StaffTokenResponseDto> {
    return this.bootstrapUseCase.execute({
      fullName: dto.fullName,
      email: dto.email,
      cpf: dto.cpf,
      registrationNumber: dto.registrationNumber,
      password: dto.password,
    });
  }
}