export class AllergyDomainException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AllergyDomainException';
  }
}

export class AllergyNotFoundException extends AllergyDomainException {
  constructor(identifier: string) {
    super(`Alergia não encontrada: ${identifier}`);
    this.name = 'AllergyNotFoundException';
  }
}

export class AllergyAccessDeniedException extends AllergyDomainException {
  constructor() {
    super('Você não tem acesso a esta alergia');
    this.name = 'AllergyAccessDeniedException';
  }
}

export class InvalidAllergyDataException extends AllergyDomainException {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidAllergyDataException';
  }
}