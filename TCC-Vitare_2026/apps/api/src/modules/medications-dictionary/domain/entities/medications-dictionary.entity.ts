export interface MedicationsDictionaryProps {
  id: string;
  nome: string;
  laboratorio: string;
  substancias: string[];
  apresentacoes: string[];
  tarjas: string[];
}

export class MedicationsDictionary {
  private constructor(private readonly props: MedicationsDictionaryProps) {}

  static reconstruct(props: MedicationsDictionaryProps): MedicationsDictionary {
    return new MedicationsDictionary(props);
  }

  get id(): string { return this.props.id; }
  get nome(): string { return this.props.nome; }
  get laboratorio(): string { return this.props.laboratorio; }
  get substancias(): string[] { return this.props.substancias; }
  get apresentacoes(): string[] { return this.props.apresentacoes; }
  get tarjas(): string[] { return this.props.tarjas; }
}