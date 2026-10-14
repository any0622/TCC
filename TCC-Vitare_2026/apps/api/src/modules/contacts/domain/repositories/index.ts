import { EmergencyContact } from '../entities/contact.entity';

export interface CreateContactData {
  userId: string;
  name: string;
  phone: string;
  relationship?: string;
  isPrimary?: boolean;
}

export abstract class ContactRepository {
  abstract findAllByUser(userId: string): Promise<EmergencyContact[]>;
  abstract findById(id: string): Promise<EmergencyContact | null>;
  abstract save(contact: EmergencyContact): Promise<EmergencyContact>;
  abstract remove(id: string): Promise<void>;
}