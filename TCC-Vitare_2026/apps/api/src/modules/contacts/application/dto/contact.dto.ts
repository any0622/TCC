export interface CreateContactCommand {
  userId: string;
  name: string;
  phone: string;
  relationship?: string;
  isPrimary?: boolean;
}

export interface RemoveContactCommand {
  id: string;
  userId: string;
}

export interface GetContactsQuery {
  userId: string;
}

export interface ContactResult {
  id: string;
  userId: string;
  name: string;
  phone: string;
  relationship: string | null;
  isPrimary: boolean;
  createdAt: Date;
}