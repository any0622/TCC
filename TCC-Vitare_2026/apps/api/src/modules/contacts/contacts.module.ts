import { Module } from '@nestjs/common';

import {
  CreateContactUseCase,
  RemoveContactUseCase,
  GetContactsUseCase,
} from './application/use-cases';

import { ContactRepositoryPort, CONTACT_REPOSITORY_PORT } from './application/ports';
import { PrismaContactRepository } from './infrastructure/repositories/prisma-contact.repository';
import { ContactsController } from './presentation/controllers/contacts.controller';

@Module({
  controllers: [ContactsController],
  providers: [
    CreateContactUseCase,
    RemoveContactUseCase,
    GetContactsUseCase,
    { provide: CONTACT_REPOSITORY_PORT, useClass: PrismaContactRepository },
  ],
  exports: [
    CreateContactUseCase,
    RemoveContactUseCase,
    GetContactsUseCase,
  ],
})
export class ContactsModule {}