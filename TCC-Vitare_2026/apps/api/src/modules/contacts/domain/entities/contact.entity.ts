export interface EmergencyContactProps {
  id: string;
  userId: string;
  name: string;
  phone: string;
  relationship: string | null;
  isPrimary: boolean;
  createdAt: Date;
}

export class EmergencyContact {
  private constructor(private readonly props: EmergencyContactProps) {}

  static create(props: Omit<EmergencyContactProps, 'id' | 'createdAt'>): EmergencyContact {
    return new EmergencyContact({
      ...props,
      id: crypto.randomUUID(),
      createdAt: new Date(),
    });
  }

  static reconstruct(props: EmergencyContactProps): EmergencyContact {
    return new EmergencyContact(props);
  }

  get id(): string { return this.props.id; }
  get userId(): string { return this.props.userId; }
  get name(): string { return this.props.name; }
  get phone(): string { return this.props.phone; }
  get relationship(): string | null { return this.props.relationship; }
  get isPrimary(): boolean { return this.props.isPrimary; }
  get createdAt(): Date { return this.props.createdAt; }

  update(data: Partial<Pick<EmergencyContactProps, 'name' | 'phone' | 'relationship' | 'isPrimary'>>): EmergencyContact {
    return new EmergencyContact({ ...this.props, ...data });
  }

  toPersistence(): EmergencyContactProps {
    return { ...this.props };
  }
}

export class ContactName {
  private constructor(private readonly value: string) {}

  static create(name: string): ContactName {
    const trimmed = name.trim();
    if (!trimmed || trimmed.length > 255) {
      throw new Error('Nome do contato deve ter entre 1 e 255 caracteres');
    }
    return new ContactName(trimmed);
  }

  getValue(): string { return this.value; }
}

export class Phone {
  private constructor(private readonly value: string) {}

  static create(phone: string): Phone {
    const normalized = phone.replace(/\D/g, '');
    if (normalized.length < 10 || normalized.length > 11) {
      throw new Error('Telefone deve ter 10 ou 11 dígitos');
    }
    return new Phone(normalized);
  }

  getValue(): string { return this.value; }

  getFormatted(): string {
    if (this.value.length === 11) {
      return this.value.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
    return this.value.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  }
}