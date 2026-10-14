export class MedicationDomainException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'MedicationDomainException';
  }
}

export class MedicationNotFoundException extends MedicationDomainException {
  constructor(identifier: string) {
    super(`Medicamento não encontrado: ${identifier}`);
    this.name = 'MedicationNotFoundException';
  }
}

export class MedicationAccessDeniedException extends MedicationDomainException {
  constructor() {
    super('Você não tem acesso a este medicamento');
    this.name = 'MedicationAccessDeniedException';
  }
}

export class InvalidMedicationDataException extends MedicationDomainException {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidMedicationDataException';
  }
}