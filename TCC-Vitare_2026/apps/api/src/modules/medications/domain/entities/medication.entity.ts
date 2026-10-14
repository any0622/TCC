export interface MedicationProps {
  id: string;
  userId: string;
  name: string;
  dosage: string;
  frequency: string;
  startDate: Date;
  endDate: Date | null;
  notes: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class Medication {
  private constructor(private readonly props: MedicationProps) {}

  static create(props: Omit<MedicationProps, 'id' | 'createdAt' | 'updatedAt'>): Medication {
    return new Medication({
      ...props,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  static reconstruct(props: MedicationProps): Medication {
    return new Medication(props);
  }

  get id(): string { return this.props.id; }
  get userId(): string { return this.props.userId; }
  get name(): string { return this.props.name; }
  get dosage(): string { return this.props.dosage; }
  get frequency(): string { return this.props.frequency; }
  get startDate(): Date { return this.props.startDate; }
  get endDate(): Date | null { return this.props.endDate; }
  get notes(): string | null { return this.props.notes; }
  get isActive(): boolean { return this.props.isActive; }
  get createdAt(): Date { return this.props.createdAt; }
  get updatedAt(): Date { return this.props.updatedAt; }

  update(data: Partial<Pick<MedicationProps, 'name' | 'dosage' | 'frequency' | 'startDate' | 'endDate' | 'notes' | 'isActive'>>): Medication {
    return new Medication({
      ...this.props,
      ...data,
      updatedAt: new Date(),
    });
  }

  activate(): Medication {
    return new Medication({ ...this.props, isActive: true, updatedAt: new Date() });
  }

  deactivate(): Medication {
    return new Medication({ ...this.props, isActive: false, updatedAt: new Date() });
  }

  toPersistence(): MedicationProps {
    return { ...this.props };
  }
}

export interface MedicationHistoryProps {
  id: string;
  medicationId: string;
  userId: string;
  changedAt: Date;
  changedField: string;
  oldValue: string | null;
  newValue: string | null;
}

export class MedicationHistory {
  private constructor(private readonly props: MedicationHistoryProps) {}

  static create(props: Omit<MedicationHistoryProps, 'id' | 'changedAt'>): MedicationHistory {
    return new MedicationHistory({
      ...props,
      id: crypto.randomUUID(),
      changedAt: new Date(),
    });
  }

  static reconstruct(props: MedicationHistoryProps): MedicationHistory {
    return new MedicationHistory(props);
  }

  get id(): string { return this.props.id; }
  get medicationId(): string { return this.props.medicationId; }
  get userId(): string { return this.props.userId; }
  get changedAt(): Date { return this.props.changedAt; }
  get changedField(): string { return this.props.changedField; }
  get oldValue(): string | null { return this.props.oldValue; }
  get newValue(): string | null { return this.props.newValue; }

  toPersistence(): MedicationHistoryProps {
    return { ...this.props };
  }
}

export class Dosage {
  private constructor(private readonly value: string) {}

  static create(dosage: string): Dosage {
    const trimmed = dosage.trim();
    if (!trimmed || trimmed.length > 100) {
      throw new Error('Dosagem deve ter entre 1 e 100 caracteres');
    }
    return new Dosage(trimmed);
  }

  getValue(): string { return this.value; }
  equals(other: Dosage): boolean { return this.value === other.value; }
}

export class Frequency {
  private constructor(private readonly value: string) {}

  static create(frequency: string): Frequency {
    const trimmed = frequency.trim();
    if (!trimmed || trimmed.length > 100) {
      throw new Error('Frequência deve ter entre 1 e 100 caracteres');
    }
    return new Frequency(trimmed);
  }

  getValue(): string { return this.value; }
  equals(other: Frequency): boolean { return this.value === other.value; }
}

export class MedicationName {
  private constructor(private readonly value: string) {}

  static create(name: string): MedicationName {
    const trimmed = name.trim();
    if (!trimmed || trimmed.length > 255) {
      throw new Error('Nome do medicamento deve ter entre 1 e 255 caracteres');
    }
    return new MedicationName(trimmed);
  }

  getValue(): string { return this.value; }
  equals(other: MedicationName): boolean { return this.value === other.value; }
}