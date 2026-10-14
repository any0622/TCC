export class BloodType {
  private static readonly VALID_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] as const;
  private constructor(private readonly value: string) {}

  static create(bloodType: string): BloodType {
    const normalized = bloodType.toUpperCase().trim();
    if (!this.isValid(normalized)) {
      throw new Error('Tipo sanguíneo inválido. Use A+, A-, B+, B-, AB+, AB-, O+ ou O-.');
    }
    return new BloodType(normalized);
  }

  static isValid(bloodType: string): boolean {
    return this.VALID_TYPES.includes(bloodType as any);
  }

  getValue(): string {
    return this.value;
  }

  equals(other: BloodType): boolean {
    return this.value === other.value;
  }
}

export class Weight {
  private constructor(private readonly value: number) {}

  static create(weightKg: number): Weight {
    if (weightKg < 0 || weightKg > 500) {
      throw new Error('Peso deve estar entre 0 e 500 kg');
    }
    return new Weight(Math.round(weightKg * 100) / 100);
  }

  getValue(): number {
    return this.value;
  }

  equals(other: Weight): boolean {
    return this.value === other.value;
  }
}

export class Height {
  private constructor(private readonly value: number) {}

  static create(heightCm: number): Height {
    if (heightCm < 0 || heightCm > 300) {
      throw new Error('Altura deve estar entre 0 e 300 cm');
    }
    return new Height(heightCm);
  }

  getValue(): number {
    return this.value;
  }

  equals(other: Height): boolean {
    return this.value === other.value;
  }
}