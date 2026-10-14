export interface PatientSnapshot {
  patient: {
    fullName: string;
    cpf: string | null;
    bloodType: string | null;
    birthDate: string | null;
    weightKg: number | null;
    heightCm: number | null;
  };
  conditions: Array<{ name: string; code: string }>;
  medications: Array<{ name: string; dosage: string; frequency: string }>;
  contacts: Array<{ name: string; phone: string; isPrimary: boolean }>;
  allergies: Array<{ name: string; severity: string | null; notes: string | null }>;
  capturedAt: string;
}

export interface EmergencyEventProps {
  id: string;
  userId: string;
  triggeredAt: Date;
  latitude: number | null;
  longitude: number | null;
  patientSnapshot: PatientSnapshot;
  status: 'TRIGGERED' | 'NOTIFIED' | 'RESOLVED';
  notes: string | null;
}

export class EmergencyEvent {
  private constructor(private readonly props: EmergencyEventProps) {}

  static create(props: Omit<EmergencyEventProps, 'id' | 'triggeredAt'>): EmergencyEvent {
    return new EmergencyEvent({
      ...props,
      id: crypto.randomUUID(),
      triggeredAt: new Date(),
    });
  }

  static reconstruct(props: EmergencyEventProps): EmergencyEvent {
    return new EmergencyEvent(props);
  }

  get id(): string { return this.props.id; }
  get userId(): string { return this.props.userId; }
  get triggeredAt(): Date { return this.props.triggeredAt; }
  get latitude(): number | null { return this.props.latitude; }
  get longitude(): number | null { return this.props.longitude; }
  get patientSnapshot(): PatientSnapshot { return this.props.patientSnapshot; }
  get status(): 'TRIGGERED' | 'NOTIFIED' | 'RESOLVED' { return this.props.status; }
  get notes(): string | null { return this.props.notes; }

  toPersistence(): EmergencyEventProps {
    return { ...this.props };
  }
}