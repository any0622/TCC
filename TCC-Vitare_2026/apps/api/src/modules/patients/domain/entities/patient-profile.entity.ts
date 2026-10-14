export interface PatientProfileProps {
  id: string;
  fullName: string;
  email: string;
  cpf: string | null;
  phone: string | null;
  address: string | null;
  birthDate: Date | null;
  bloodType: string | null;
  weightKg: number | null;
  heightCm: number | null;
  createdAt: Date;
  updatedAt: Date;
}

export class PatientProfile {
  private constructor(private readonly props: PatientProfileProps) {}

  static reconstruct(props: PatientProfileProps): PatientProfile {
    return new PatientProfile(props);
  }

  get id(): string { return this.props.id; }
  get fullName(): string { return this.props.fullName; }
  get email(): string { return this.props.email; }
  get cpf(): string | null { return this.props.cpf; }
  get phone(): string | null { return this.props.phone; }
  get address(): string | null { return this.props.address; }
  get birthDate(): Date | null { return this.props.birthDate; }
  get bloodType(): string | null { return this.props.bloodType; }
  get weightKg(): number | null { return this.props.weightKg; }
  get heightCm(): number | null { return this.props.heightCm; }
  get createdAt(): Date { return this.props.createdAt; }
  get updatedAt(): Date { return this.props.updatedAt; }

  update(data: Partial<Pick<PatientProfileProps, 'fullName' | 'cpf' | 'phone' | 'address' | 'birthDate' | 'bloodType' | 'weightKg' | 'heightCm'>>): PatientProfile {
    return new PatientProfile({
      ...this.props,
      ...data,
      birthDate: data.birthDate ?? this.props.birthDate,
      updatedAt: new Date(),
    });
  }

  toPersistence(): PatientProfileProps {
    return { ...this.props };
  }
}