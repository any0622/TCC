import { EmergencyStatus } from '../../../../generated/prisma/client';
import { Coordinates } from './haversine';

export interface EmergencySnapshot {
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
  allergies: Array<{
    name: string;
    severity: string | null;
    notes: string | null;
  }>;
  capturedAt: string;
}

export class EmergencyEvent {
  private constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly triggeredAt: Date,
    public readonly coordinates: Coordinates | null,
    public readonly snapshot: EmergencySnapshot,
    public readonly status: EmergencyStatus,
    public readonly notes: string | null,
  ) {}

  static create(
    id: string,
    userId: string,
    coordinates: Coordinates | null,
    snapshot: EmergencySnapshot,
  ): EmergencyEvent {
    return new EmergencyEvent(
      id,
      userId,
      new Date(),
      coordinates,
      snapshot,
      'TRIGGERED',
      null,
    );
  }

  static reconstruct(
    id: string,
    userId: string,
    triggeredAt: Date,
    coordinates: Coordinates | null,
    snapshot: EmergencySnapshot,
    status: EmergencyStatus,
    notes: string | null,
  ): EmergencyEvent {
    return new EmergencyEvent(
      id,
      userId,
      triggeredAt,
      coordinates,
      snapshot,
      status,
      notes,
    );
  }

  get isTriggered(): boolean {
    return this.status === 'TRIGGERED';
  }

  get isNotified(): boolean {
    return this.status === 'NOTIFIED';
  }

  get isResolved(): boolean {
    return this.status === 'RESOLVED';
  }

  canTransitionTo(newStatus: EmergencyStatus): boolean {
    const validTransitions: Record<EmergencyStatus, EmergencyStatus[]> = {
      TRIGGERED: ['NOTIFIED', 'RESOLVED'],
      NOTIFIED: ['RESOLVED'],
      RESOLVED: [],
    };

    return validTransitions[this.status]?.includes(newStatus) ?? false;
  }

  transitionTo(newStatus: EmergencyStatus, notes?: string): EmergencyEvent {
    if (!this.canTransitionTo(newStatus)) {
      throw new Error(`Invalid transition from ${this.status} to ${newStatus}`);
    }

    return new EmergencyEvent(
      this.id,
      this.userId,
      this.triggeredAt,
      this.coordinates,
      this.snapshot,
      newStatus,
      notes ?? this.notes,
    );
  }

  toPersistence() {
    return {
      id: this.id,
      userId: this.userId,
      triggeredAt: this.triggeredAt,
      latitude: this.coordinates?.latitude ?? null,
      longitude: this.coordinates?.longitude ?? null,
      patientSnapshot: this.snapshot as any,
      status: this.status,
      notes: this.notes,
    };
  }
}
