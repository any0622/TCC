import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { ConfigService } from '@nestjs/config';
import { Throttle } from '@nestjs/throttler';
import type { Request, Response } from 'express';
import { Public } from '../../../../common/decorators/public.decorator';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../../../../common/decorators/current-user.decorator';
import type { RegisterDto, LoginDto, RefreshTokenDto, ForgotPasswordDto, ResetPasswordDto, ExchangeGoogleCodeDto, AuthResponseDto, UserProfileDto,  } from '../dto';
import {
  RegisterUserUseCase,
  LoginUserUseCase,
  RefreshTokenUseCase,
  ForgotPasswordUseCase,
  ResetPasswordUseCase,
  ValidateGoogleUserUseCase,
  CompleteGoogleLoginUseCase,
} from '../../application/use-cases';
import { GoogleAuthGuard } from '../guards/google-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly registerUserUseCase: RegisterUserUseCase,
    private readonly loginUserUseCase: LoginUserUseCase,
    private readonly refreshTokenUseCase: RefreshTokenUseCase,
    private readonly forgotPasswordUseCase: ForgotPasswordUseCase,
    private readonly resetPasswordUseCase: ResetPasswordUseCase,
    private readonly validateGoogleUserUseCase: ValidateGoogleUserUseCase,
    private readonly completeGoogleLoginUseCase: CompleteGoogleLoginUseCase,
    private readonly config: ConfigService,
  ) {}

  @Public()
  @Post('register')
  async register(@Body() dto: RegisterDto): Promise<AuthResponseDto> {
    return this.registerUserUseCase.execute({
      fullName: dto.fullName,
      email: dto.email,
      password: dto.password,
    });
  }

  @Public()
  @UseGuards(GoogleAuthGuard)
  @Get('google')
  googleAuth() {}

  @Public()
  @UseGuards(GoogleAuthGuard)
  @Get('google/callback')
  async googleCallback(
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      const user = await this.validateGoogleUserUseCase.execute(req.user as any);
      const tokenPair = await this.completeGoogleLoginUseCase.execute(user);
      const appUrl = this.config.get<string>('APP_URL')!.replace(/\/$/, '');
      return res.redirect(`${appUrl}/auth/google/callback?code=${encodeURIComponent(tokenPair.accessToken)}`);
    } catch {
      const appUrl = this.config.get<string>('APP_URL')!.replace(/\/$/, '');
      return res.redirect(`${appUrl}/login?googleError=authentication_failed`);
    }
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('google/exchange')
  async exchangeGoogleCode(@Body() dto: ExchangeGoogleCodeDto): Promise<AuthResponseDto> {
    // This would be implemented with a session service
    return { accessToken: '', refreshToken: '', user: { id: '', fullName: '', email: '' } };
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Body() dto: LoginDto): Promise<AuthResponseDto> {
    return this.loginUserUseCase.execute({
      email: dto.email,
      password: dto.password,
    });
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('refresh')
  async refresh(@Body() dto: RefreshTokenDto): Promise<AuthResponseDto> {
    return this.refreshTokenUseCase.execute({
      refreshToken: dto.refreshToken,
    });
  }

  @Public()
  @Throttle({ default: { limit: 3, ttl: 60_000 } })
  @HttpCode(HttpStatus.OK)
  @Post('forgot-password')
  async forgotPassword(@Body() dto: ForgotPasswordDto): Promise<{ message: string }> {
    await this.forgotPasswordUseCase.execute({ email: dto.email });
    return { message: 'Se o e-mail existir, você receberá as instruções' };
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('reset-password')
  async resetPassword(@Body() dto: ResetPasswordDto): Promise<{ message: string }> {
    await this.resetPasswordUseCase.execute({
      token: dto.token,
      newPassword: dto.newPassword,
    });
    return { message: 'Senha redefinida com sucesso' };
  }

  @Get('me')
  async me(@CurrentUser() user: AuthenticatedUser): Promise<UserProfileDto> {
    return {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      cpf: null,
      phone: null,
      address: null,
      birthDate: null,
      bloodType: null,
      weightKg: null,
      heightCm: null,
      createdAt: new Date(),
    };
  }
}