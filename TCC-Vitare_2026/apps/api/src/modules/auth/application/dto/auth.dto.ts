export interface RegisterUserCommand {
  fullName: string;
  email: string;
  password: string;
}

export interface LoginCommand {
  email: string;
  password: string;
}

export interface RefreshTokenCommand {
  refreshToken: string;
}

export interface ForgotPasswordCommand {
  email: string;
}

export interface ResetPasswordCommand {
  token: string;
  newPassword: string;
}

export interface GoogleAuthCommand {
  code: string;
}

export interface TokenPairResult {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    fullName: string;
    email: string;
  };
}

export interface UserProfileResult {
  id: string;
  fullName: string;
  email: string;
  cpf: string | null;
  phone: string | null;
  address: string | null;
  birthDate: Date | null;
  bloodType: string | null;
  weightKg: number | null;
  heightCm: number | null;
  createdAt: Date;
}