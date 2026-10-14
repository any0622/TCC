export interface StaffProps {
  id: string;
  fullName: string;
  email: string;
  cpf: string | null;
  registrationNumber: string;
  role: 'MEDICO_SOCORRISTA' | 'ENFERMEIRO_SOCORRISTA' | 'TECNICO_ENFERMAGEM' | 'OPERADOR_TACTICAL' | 'ADMINISTRATIVO';
  passwordHash: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export class Staff {
  private constructor(private readonly props: StaffProps) {}

  static create(props: Omit<StaffProps, 'id' | 'createdAt' | 'updatedAt'>): Staff {
    return new Staff({
      ...props,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  static reconstruct(props: StaffProps): Staff {
    return new Staff(props);
  }

  get id(): string { return this.props.id; }
  get fullName(): string { return this.props.fullName; }
  get email(): string { return this.props.email; }
  get cpf(): string | null { return this.props.cpf; }
  get registrationNumber(): string { return this.props.registrationNumber; }
  get role(): StaffProps['role'] { return this.props.role; }
  get passwordHash(): string | null { return this.props.passwordHash; }
  get createdAt(): Date { return this.props.createdAt; }
  get updatedAt(): Date { return this.props.updatedAt; }

  updatePassword(passwordHash: string): Staff {
    return new Staff({ ...this.props, passwordHash, updatedAt: new Date() });
  }

  toPersistence(): StaffProps {
    return { ...this.props };
  }

  toSafeObject(): Omit<StaffProps, 'passwordHash'> {
    const { passwordHash: _, ...safe } = this.props;
    return safe;
  }
}