export class EmergencyDomainException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'EmergencyDomainException';
  }
}

export class InvalidCoordinatesException extends EmergencyDomainException {
  constructor() {
    super('Latitude e longitude devem ser enviadas juntas ou ambas omitidas');
    this.name = 'InvalidCoordinatesException';
  }
}

export class IdempotencyKeyRequiredException extends EmergencyDomainException {
  constructor() {
    super('X-Idempotency-Key header é obrigatório');
    this.name = 'IdempotencyKeyRequiredException';
  }
}