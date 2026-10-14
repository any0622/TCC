export const CONTACTS_REPOSITORY_PORT = 'CONTACTS_REPOSITORY_PORT';
import { EmergencyContact } from '../../domain/entities/contact.entity';

export interface ContactRepositoryPort {
  findAllByUser(userId: string): Promise<EmergencyContact[]>;
  findById(id: string): Promise<EmergencyContact | null>;
  save(contact: EmergencyContact): Promise<EmergencyContact>;
  remove(id: string): Promise<void>;
}