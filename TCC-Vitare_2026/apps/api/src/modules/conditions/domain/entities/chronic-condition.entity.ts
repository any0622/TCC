export interface ChronicConditionProps {
  id: string;
  userId: string;
  diseaseId: string;
  notes: string | null;
  diagnosedAt: Date | null;
  isActive: boolean;
  createdAt: Date;
}

export class ChronicCondition {
  private constructor(private readonly props: ChronicConditionProps) {}

  static create(props: Omit<ChronicConditionProps, 'id' | 'createdAt'>): ChronicCondition {
    return new ChronicCondition({
      ...props,
      id: crypto.randomUUID(),
      createdAt: new Date(),
    });
  }

  static reconstruct(props: ChronicConditionProps): ChronicCondition {
    return new ChronicCondition(props);
  }

  get id(): string { return this.props.id; }
  get userId(): string { return this.props.userId; }
  get diseaseId(): string { return this.props.diseaseId; }
  get notes(): string | null { return this.props.notes; }
  get diagnosedAt(): Date | null { return this.props.diagnosedAt; }
  get isActive(): boolean { return this.props.isActive; }
  get createdAt(): Date { return this.props.createdAt; }

  update(data: Partial<Pick<ChronicConditionProps, 'notes' | 'diagnosedAt' | 'isActive'>>): ChronicCondition {
    return new ChronicCondition({ ...this.props, ...data });
  }

  deactivate(): ChronicCondition {
    return new ChronicCondition({ ...this.props, isActive: false });
  }

  toPersistence(): ChronicConditionProps {
    return { ...this.props };
  }
}