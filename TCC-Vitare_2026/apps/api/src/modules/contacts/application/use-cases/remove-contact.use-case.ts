import { Injectable } from '@nestjs/common';
import type { ContactRepositoryPort } from '../ports';
import { RemoveContactCommand } from '../dto/contact.dto';
import { ContactNotFoundException, ContactAccessDeniedException } from '../../domain/exceptions';

@Injectable()
export class RemoveContactUseCase {
  constructor(private readonly contactRepository: ContactRepositoryPort) {}

  async execute(command: RemoveContactCommand): Promise<void> {
    const existing = await this.contactRepository.findById(command.id);
    if (!existing) {
      throw new ContactNotFoundException(command.id);
    }
    if (existing.userId !== command.userId) {
      throw new ContactAccessDeniedException();
    }
    await this.contactRepository.remove(command.id);
  }
}