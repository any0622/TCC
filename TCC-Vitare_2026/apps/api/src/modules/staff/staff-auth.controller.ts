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
import type { Request } from 'express';
import { Public } from '../../common/decorators/public.decorator';
import { LoginStaffDto } from './dto/login-staff.dto';
import { RegisterStaffDto } from './dto/register-staff.dto';
import { StaffAuthService } from './staff-auth.service';
import { StaffJwtAuthGuard } from './guards/staff-jwt-auth.guard';

@Controller('staff/auth')
export class StaffAuthController {
  constructor(private readonly staffAuthService: StaffAuthService) {}

  @UseGuards(StaffJwtAuthGuard)
  @Get('me')
  me(@Req() req: Request & { user: { id: string } }) {
    return this.staffAuthService.me(req.user.id);
  }

  @UseGuards(StaffJwtAuthGuard)
  @Post('register')
  register(
    @Req() req: Request & { user: { id: string; role: string } },
    @Body() dto: RegisterStaffDto,
  ) {
    if (req.user.role !== 'ADMINISTRATIVO') {
      return { error: 'Apenas administradores podem criar contas de staff' };
    }
    return this.staffAuthService.register(
      dto.fullName,
      dto.email,
      dto.cpf,
      dto.registrationNumber,
      dto.role,
      dto.password,
    );
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('login')
  login(@Body() dto: LoginStaffDto) {
    return this.staffAuthService.login(dto.email, dto.password);
  }

  @Public()
  @Post('bootstrap')
  async bootstrap(@Body() dto: RegisterStaffDto) {
    const existing = await this.staffAuthService.checkAnyStaffExists();
    if (existing) {
      return {
        error:
          'Bootstrap já realizado. Use o endpoint autenticado para criar novos staffs.',
      };
    }
    return this.staffAuthService.bootstrapAdmin(
      dto.fullName,
      dto.email,
      dto.cpf,
      dto.registrationNumber,
      dto.password,
    );
  }
}
