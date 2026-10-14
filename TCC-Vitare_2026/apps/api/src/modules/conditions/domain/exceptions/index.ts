export class ConditionDomainException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ConditionDomainException';
  }
}

export class ConditionNotFoundException extends ConditionDomainException {
  constructor(identifier: string) {
    super(`Condição não encontrada: ${identifier}`);
    this.name = 'ConditionNotFoundException';
  }
}

export class ConditionAccessDeniedException extends ConditionDomainException {
  constructor() {
    super('Você não tem acesso a esta condição');
    this.name = 'ConditionAccessDeniedException';
  }
}