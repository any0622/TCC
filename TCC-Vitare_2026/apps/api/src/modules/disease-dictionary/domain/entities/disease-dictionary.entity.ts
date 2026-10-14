export interface DiseaseDictionaryProps {
  id: string;
  code: string;
  name: string;
  groupName: string | null;
}

export class DiseaseDictionary {
  private constructor(private readonly props: DiseaseDictionaryProps) {}

  static reconstruct(props: DiseaseDictionaryProps): DiseaseDictionary {
    return new DiseaseDictionary(props);
  }

  get id(): string { return this.props.id; }
  get code(): string { return this.props.code; }
  get name(): string { return this.props.name; }
  get groupName(): string | null { return this.props.groupName; }
}