import { IsEmail, IsNotEmpty, IsString, MinLength, MaxLength } from 'class-validator';

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(255)
  fullName!: string;

  @IsEmail()
  @MaxLength(320)
  email!: string;

  @IsString()
  @MinLength(8)
  @MaxLength(72)
  password!: string;
}

export class LoginDto {
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @IsString()
  @IsNotEmpty()
  password!: string;
}

export class RefreshTokenDto {
  @IsString()
  @IsNotEmpty()
  refreshToken!: string;
}

export class ForgotPasswordDto {
  @IsEmail()
  @IsNotEmpty()
  email!: string;
}

export class ResetPasswordDto {
  @IsString()
  @IsNotEmpty()
  token!: string;

  @IsString()
  @MinLength(8)
  @MaxLength(72)
  newPassword!: string;
}

export class ExchangeGoogleCodeDto {
  @IsString()
  @IsNotEmpty()
  code!: string;
}

export class AuthResponseDto {
  accessToken!: string;
  refreshToken!: string;
  user!: {
    id: string;
    fullName: string;
    email: string;
  };
}

export class UserProfileDto {
  id!: string;
  fullName!: string;
  email!: string;
  cpf!: string | null;
  phone!: string | null;
  address!: string | null;
  birthDate!: Date | null;
  bloodType!: string | null;
  weightKg!: number | null;
  heightCm!: number | null;
  createdAt!: Date;
}