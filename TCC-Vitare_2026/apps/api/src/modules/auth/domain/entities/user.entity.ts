export interface UserProps {
  id: string;
  fullName: string;
  email: string;
  passwordHash: string | null;
  googleId: string | null;
  avatarUrl: string | null;
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

export class User {
  private constructor(private readonly props: UserProps) {}

  static create(props: Omit<UserProps, 'id' | 'createdAt' | 'updatedAt'>): User {
    return new User({
      ...props,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  static reconstruct(props: UserProps): User {
    return new User(props);
  }

  get id(): string { return this.props.id; }
  get fullName(): string { return this.props.fullName; }
  get email(): string { return this.props.email; }
  get passwordHash(): string | null { return this.props.passwordHash; }
  get googleId(): string | null { return this.props.googleId; }
  get avatarUrl(): string | null { return this.props.avatarUrl; }
  get cpf(): string | null { return this.props.cpf; }
  get phone(): string | null { return this.props.phone; }
  get address(): string | null { return this.props.address; }
  get birthDate(): Date | null { return this.props.birthDate; }
  get bloodType(): string | null { return this.props.bloodType; }
  get weightKg(): number | null { return this.props.weightKg; }
  get heightCm(): number | null { return this.props.heightCm; }
  get createdAt(): Date { return this.props.createdAt; }
  get updatedAt(): Date { return this.props.updatedAt; }

  updatePassword(passwordHash: string): User {
    return new User({
      ...this.props,
      passwordHash,
      updatedAt: new Date(),
    });
  }

  updateProfile(data: Partial<Pick<UserProps, 'fullName' | 'phone' | 'address' | 'birthDate' | 'bloodType' | 'weightKg' | 'heightCm'>>): User {
    return new User({
      ...this.props,
      ...data,
      updatedAt: new Date(),
    });
  }

  toPersistence(): UserProps {
    return { ...this.props };
  }

  toSafeObject(): Omit<UserProps, 'passwordHash'> {
    const { passwordHash: _, ...safe } = this.props;
    return safe;
  }
}