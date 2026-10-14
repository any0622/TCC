export class PatientDomainException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PatientDomainException';
  }
}

export class PatientNotFoundException extends PatientDomainException {
  constructor(identifier: string) {
    super(`Paciente não encontrado: ${identifier}`);
    this.name = 'PatientNotFoundException';
  }
}

export class InvalidPatientDataException extends PatientDomainException {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidPatientDataException';
  }
}