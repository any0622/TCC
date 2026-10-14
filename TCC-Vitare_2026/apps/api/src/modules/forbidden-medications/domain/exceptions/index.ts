export class ForbiddenMedicationDomainException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ForbiddenMedicationDomainException';
  }
}

export class ForbiddenMedicationNotFoundException extends ForbiddenMedicationDomainException {
  constructor(identifier: string) {
    super(`Registro não encontrado: ${identifier}`);
    this.name = 'ForbiddenMedicationNotFoundException';
  }
}

export class ForbiddenMedicationAccessDeniedException extends ForbiddenMedicationDomainException {
  constructor() {
    super('Você não tem acesso a este registro');
    this.name = 'ForbiddenMedicationAccessDeniedException';
  }
}

export class ForbiddenMedicationAlreadyExistsException extends ForbiddenMedicationDomainException {
  constructor() {
    super('Este medicamento já está na lista de proibidos');
    this.name = 'ForbiddenMedicationAlreadyExistsException';
  }
}