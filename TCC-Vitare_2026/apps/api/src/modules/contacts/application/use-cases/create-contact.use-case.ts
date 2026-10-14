import { Injectable } from '@nestjs/common';
import type { ContactRepositoryPort } from '../ports';
import { CreateContactCommand, ContactResult } from '../dto/contact.dto';
import { EmergencyContact, ContactName, Phone } from '../../domain/entities/contact.entity';
import { InvalidContactDataException } from '../../domain/exceptions';

@Injectable()
export class CreateContactUseCase {
  constructor(private readonly contactRepository: ContactRepositoryPort) {}

  async execute(command: CreateContactCommand): Promise<ContactResult> {
    const name = ContactName.create(command.name);
    const phone = Phone.create(command.phone);

    const contact = EmergencyContact.create({
      userId: command.userId,
      name: name.getValue(),
      phone: phone.getValue(),
      relationship: command.relationship ?? null,
      isPrimary: command.isPrimary ?? false,
    });

    const saved = await this.contactRepository.save(contact);
    return this.toResult(saved);
  }

  private toResult(contact: EmergencyContact): ContactResult {
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