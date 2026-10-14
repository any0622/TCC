import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export enum StaffRole {
  MEDICO_SOCORRISTA = 'MEDICO_SOCORRISTA',
  ENFERMEIRO_SOCORRISTA = 'ENFERMEIRO_SOCORRISTA',
  TECNICO_ENFERMAGEM = 'TECNICO_ENFERMAGEM',
  OPERADOR_TACTICAL = 'OPERADOR_TACTICAL',
  ADMINISTRATIVO = 'ADMINISTRATIVO',
}

const PASSWORD_COMPLEXITY_PATTERN =
  /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[\\/\\*\-\\+\\.\\)\\(\\&\\%\\$\\#\\@\\!]).{8,}$/;

export class RegisterStaffRequestDto {
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  fullName!: string;

  @IsEmail()
  @MaxLength(320)
  email!: string;

  @IsString()
  @Matches(/^\d{11}$/, { message: 'O CPF deve conter exatamente 11 dígitos numéricos.' })
  cpf!: string;

  @IsString()
  @IsNotEmpty({ message: 'O registro profissional é obrigatório.' })
  registrationNumber!: string;

  @IsString()
  @MinLength(8, { message: 'A senha deve ter no mínimo 8 caracteres' })
  @MaxLength(72, { message: 'A senha deve ter no máximo 72 caracteres' })
  @Matches(PASSWORD_COMPLEXITY_PATTERN, {
    message: 'A senha deve conter ao menos um número, uma letra maiúscula, uma letra minúscula e um caractere especial',
  })
  password!: string;
}

export class LoginStaffRequestDto {
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @IsString()
  @IsNotEmpty()
  password!: string;
}

export class StaffTokenResponseDto {
  accessToken!: string;
  staff!: {
    id: string;
    fullName: string;
    email: string;
    cpf: string | null;
    registrationNumber: string;
    role: string;
  };
}