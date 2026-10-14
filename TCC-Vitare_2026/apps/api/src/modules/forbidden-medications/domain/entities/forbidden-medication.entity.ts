export interface ForbiddenMedicationProps {
  id: string;
  userId: string;
  medicationsDictionaryId: string;
  reason: string;
  createdAt: Date;
}

export class ForbiddenMedication {
  private constructor(private readonly props: ForbiddenMedicationProps) {}

  static create(props: Omit<ForbiddenMedicationProps, 'id' | 'createdAt'>): ForbiddenMedication {
    return new ForbiddenMedication({
      ...props,
      id: crypto.randomUUID(),
      createdAt: new Date(),
    });
  }

  static reconstruct(props: ForbiddenMedicationProps): ForbiddenMedication {
    return new ForbiddenMedication(props);
  }

  get id(): string { return this.props.id; }
  get userId(): string { return this.props.userId; }
  get medicationsDictionaryId(): string { return this.props.medicationsDictionaryId; }
  get reason(): string { return this.props.reason; }
  get createdAt(): Date { return this.props.createdAt; }

  toPersistence(): ForbiddenMedicationProps {
    return { ...this.props };
  }
}