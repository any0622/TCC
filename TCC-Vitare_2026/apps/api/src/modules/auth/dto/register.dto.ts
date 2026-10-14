import {
  IsEmail,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

/**
 * Dom�nios de e-mail aceitos no cadastro por credenciais. O Gmail é
 * deliberadamente exclu�do: contas @gmail.com devem se cadastrar via
 * "Entrar com Google" (OAuth), evitando que o mesmo endereço exista
 * simultaneamente como conta local e como conta federada — cenário que
 * o AuthService não reconcilia automaticamente por design de segurança.
 */
const ALLOWED_EMAIL_DOMAINS = [
  'hotmail.com',
  'outlook.com',
  'live.com',
  'msn.com',
  'yahoo.com',
  'yahoo.com.br',
  'icloud.com',
  'uol.com.br',
  'bol.com.br',
  'terra.com.br',
];

const EMAIL_DOMAIN_PATTERN = new RegExp(
  `^[^\\s@]+@(${ALLOWED_EMAIL_DOMAINS.map((d) => d.replace('.', '\\.')).join('|')})$`,
  'i',
);

/** M�nimo 8 caracteres, ao menos uma letra e ao menos um número. */
const PASSWORD_COMPLEXITY_PATTERN =
  /^((?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[\\/\\*\-\\+\\.\\)\\(\\&\\%\\$\\#\\@\\!]).{8})$/;

export class RegisterDto {
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  fullName!: string;

  @IsEmail()
  @MaxLength(320)
  @Matches(EMAIL_DOMAIN_PATTERN, {
    message: `Use um e-mail de um destes provedores: ${ALLOWED_EMAIL_DOMAINS.join(', ')}. Contas Gmail devem entrar com "Continuar com Google".`,
  })
  email!: string;

  @IsString()
  @MinLength(8, { message: 'A senha deve ter no m�nimo 8 caracteres' })
  @MaxLength(72)
  @Matches(PASSWORD_COMPLEXITY_PATTERN, {
    message: 'A senha deve conter ao menos uma letra e um número',
  })
  password!: string;
}
