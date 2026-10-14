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