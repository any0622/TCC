import { Module } from '@nestjs/common';
import { ContactsController } from './contacts.controller';
import { ContactsService } from './contacts.service';
import { ContactsRepository } from './repositories/contacts.repository';
import { PrismaContactsRepository } from './repositories/prisma-contacts.repository';

@Module({
  controllers: [ContactsController],
  providers: [
    ContactsService,
    { provide: ContactsRepository, useClass: PrismaContactsRepository },
  ],
})
export class ContactsModule {}
