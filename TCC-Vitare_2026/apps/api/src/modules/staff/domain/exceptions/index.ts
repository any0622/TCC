export class StaffDomainException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'StaffDomainException';
  }
}

export class StaffAlreadyExistsException extends StaffDomainException {
  constructor(email: string) {
    super(`E-mail já cadastrado: ${email}`);
    this.name = 'StaffAlreadyExistsException';
  }
}

export class StaffNotFoundException extends StaffDomainException {
  constructor(identifier: string) {
    super(`Staff não encontrado: ${identifier}`);
    this.name = 'StaffNotFoundException';
  }
}

export class InvalidStaffCredentialsException extends StaffDomainException {
  constructor() {
    super('E-mail ou senha inválidos');
    this.name = 'InvalidStaffCredentialsException';
  }
}

export class BootstrapAlreadyCompletedException extends StaffDomainException {
  constructor() {
    super('Bootstrap já realizado. Use o endpoint autenticado para criar novos staffs.');
    this.name = 'BootstrapAlreadyCompletedException';
  }
}