export interface AllergyProps {
  id: string;
  userId: string;
  name: string;
  severity: string | null;
  notes: string | null;
  createdAt: Date;
}

export class Allergy {
  private constructor(private readonly props: AllergyProps) {}

  static create(props: Omit<AllergyProps, 'id' | 'createdAt'>): Allergy {
    return new Allergy({
      ...props,
      id: crypto.randomUUID(),
      createdAt: new Date(),
    });
  }

  static reconstruct(props: AllergyProps): Allergy {
    return new Allergy(props);
  }

  get id(): string { return this.props.id; }
  get userId(): string { return this.props.userId; }
  get name(): string { return this.props.name; }
  get severity(): string | null { return this.props.severity; }
  get notes(): string | null { return this.props.notes; }
  get createdAt(): Date { return this.props.createdAt; }

  update(data: Partial<Pick<AllergyProps, 'name' | 'severity' | 'notes'>>): Allergy {
    return new Allergy({ ...this.props, ...data });
  }

  toPersistence(): AllergyProps {
    return { ...this.props };
  }
}

export class AllergyName {
  private constructor(private readonly value: string) {}

  static create(name: string): AllergyName {
    const trimmed = name.trim();
    if (!trimmed || trimmed.length > 255) {
      throw new Error('Nome da alergia deve ter entre 1 e 255 caracteres');
    }
    return new AllergyName(trimmed);
  }

  getValue(): string { return this.value; }
}