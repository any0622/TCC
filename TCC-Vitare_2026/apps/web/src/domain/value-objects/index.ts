export class Email {
  private constructor(private readonly value: string) {}

  static create(email: string): Email {
    const normalized = email.trim().toLowerCase();
    if (!this.isValid(normalized)) {
      throw new Error('Email inválido');
    }
    return new Email(normalized);
  }

  static isValid(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && email.length <= 320;
  }

  getValue(): string {
    return this.value;
  }
}

export class CPF {
  private constructor(private readonly value: string) {}

  static create(cpf: string): CPF {
    const normalized = cpf.replace(/\D/g, '');
    if (!this.isValid(normalized)) {
      throw new Error('CPF inválido');
    }
    return new CPF(normalized);
  }

  static isValid(cpf: string): boolean {
    if (cpf.length !== 11) return false;
    if (/^(\d)\1{10}$/.test(cpf)) return false;

    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cpf[i]) * (10 - i);
    }
    let digit = (sum * 10) % 11;
    if (digit === 10) digit = 0;
    if (digit !== parseInt(cpf[9])) return false;

    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cpf[i]) * (11 - i);
    }
    digit = (sum * 10) % 11;
    if (digit === 10) digit = 0;
    if (digit !== parseInt(cpf[10])) return false;

    return true;
  }

  getValue(): string {
    return this.value;
  }

  getFormatted(): string {
    return this.value.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }
}

export class Phone {
  private constructor(private readonly value: string) {}

  static create(phone: string): Phone {
    const normalized = phone.replace(/\D/g, '');
    if (!this.isValid(normalized)) {
      throw new Error('Telefone inválido');
    }
    return new Phone(normalized);
  }

  static isValid(phone: string): boolean {
    return phone.length >= 10 && phone.length <= 11;
  }

  getValue(): string {
    return this.value;
  }

  getFormatted(): string {
    if (this.value.length === 11) {
      return this.value.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
    return this.value.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  }
}