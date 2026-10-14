import { Injectable } from '@nestjs/common';
import type { ContactRepositoryPort } from '../ports';
import { GetContactsQuery, ContactResult } from '../dto/contact.dto';

@Injectable()
export class GetContactsUseCase {
  constructor(private readonly contactRepository: ContactRepositoryPort) {}

  async execute(query: GetContactsQuery): Promise<ContactResult[]> {
    const contacts = await this.contactRepository.findAllByUser(query.userId);
    return contacts.map(this.toResult);
  }

  private toResult(contact: any): ContactResult {
    return {
      id: contact.id,
      userId: contact.userId,
      name: contact.name,
      phone: contact.phone,
      relationship: contact.relationship,
      isPrimary: contact.isPrimary,
      createdAt: contact.createdAt,
    };
  }
}