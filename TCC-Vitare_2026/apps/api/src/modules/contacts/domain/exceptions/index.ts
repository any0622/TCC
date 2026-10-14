export class ContactDomainException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ContactDomainException';
  }
}

export class ContactNotFoundException extends ContactDomainException {
  constructor(identifier: string) {
    super(`Contato não encontrado: ${identifier}`);
    this.name = 'ContactNotFoundException';
  }
}

export class ContactAccessDeniedException extends ContactDomainException {
  constructor() {
    super('Você não tem acesso a este contato');
    this.name = 'ContactAccessDeniedException';
  }
}

export class InvalidContactDataException extends ContactDomainException {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidContactDataException';
  }
}