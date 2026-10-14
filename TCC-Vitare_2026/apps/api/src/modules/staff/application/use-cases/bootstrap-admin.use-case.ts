import { Injectable } from '@nestjs/common';
import type { StaffRepositoryPort, HashingServicePort, TokenGeneratorPort } from '../ports';
import { BootstrapAdminCommand, StaffTokenResult } from '../dto/staff.dto';
import { Staff } from '../../domain/entities/staff.entity';
import { StaffAlreadyExistsException, BootstrapAlreadyCompletedException } from '../../domain/exceptions';

@Injectable()
export class BootstrapAdminUseCase {
  constructor(
    private readonly staffRepository: StaffRepositoryPort,
    private readonly hashingService: HashingServicePort,
    private readonly tokenGenerator: TokenGeneratorPort,
  ) {}

  async execute(command: BootstrapAdminCommand): Promise<StaffTokenResult> {
    const existingAny = await this.staffRepository.findAny();
    if (existingAny) throw new BootstrapAlreadyCompletedException();

    const existing = await this.staffRepository.findByEmail(command.email);
    if (existing) throw new StaffAlreadyExistsException(command.email);

    const passwordHash = await this.hashingService.hash(command.password);
    const staff = Staff.create({
      fullName: command.fullName,
      email: command.email,
      cpf: command.cpf,
      registrationNumber: command.registrationNumber,
      role: 'ADMINISTRATIVO',
      passwordHash,
    });

    const saved = await this.staffRepository.save(staff);
    return this.issueToken(saved);
  }

  private issueToken(staff: Staff): StaffTokenResult {
    const accessToken = this.tokenGenerator.generateAccessToken(
      { sub: staff.id, email: staff.email, type: 'staff', role: staff.role },
      '8h',
    );
    return {
      accessToken,
      staff: {
        id: staff.id,
        fullName: staff.fullName,
        email: staff.email,
        cpf: staff.cpf,
        registrationNumber: staff.registrationNumber,
        role: staff.role,
      },
    };
  }
}