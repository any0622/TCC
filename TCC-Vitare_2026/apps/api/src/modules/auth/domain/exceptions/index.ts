export class AuthDomainException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthDomainException';
  }
}

export class UserAlreadyExistsException extends AuthDomainException {
  constructor(email: string) {
    super(`Usuário com email ${email} já existe`);
    this.name = 'UserAlreadyExistsException';
  }
}

export class UserNotFoundException extends AuthDomainException {
  constructor(identifier: string) {
    super(`Usuário não encontrado: ${identifier}`);
    this.name = 'UserNotFoundException';
  }
}

export class InvalidCredentialsException extends AuthDomainException {
  constructor() {
    super('Credenciais inválidas');
    this.name = 'InvalidCredentialsException';
  }
}

export class InvalidRefreshTokenException extends AuthDomainException {
  constructor(message: string = 'Refresh token inválido ou expirado') {
    super(message);
    this.name = 'InvalidRefreshTokenException';
  }
}

export class RefreshTokenReusedException extends AuthDomainException {
  constructor() {
    super('Refresh token já utilizado - possível tentativa de reutilização');
    this.name = 'RefreshTokenReusedException';
  }
}

export class InvalidPasswordResetTokenException extends AuthDomainException {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidPasswordResetTokenException';
  }
}

export class GoogleAccountNotLinkedException extends AuthDomainException {
  constructor(email: string) {
    super(`Conta Google não vinculada ao email ${email}`);
    this.name = 'GoogleAccountNotLinkedException';
  }
}