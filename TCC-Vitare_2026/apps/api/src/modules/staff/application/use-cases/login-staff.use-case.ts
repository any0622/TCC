import { Injectable } from '@nestjs/common';
import type { StaffRepositoryPort, HashingServicePort, TokenGeneratorPort } from '../ports';
import { LoginStaffCommand, StaffTokenResult } from '../dto/staff.dto';
import { Staff } from '../../domain/entities/staff.entity';
import { InvalidStaffCredentialsException } from '../../domain/exceptions';

@Injectable()
export class LoginStaffUseCase {
  constructor(
    private readonly staffRepository: StaffRepositoryPort,
    private readonly hashingService: HashingServicePort,
    private readonly tokenGenerator: TokenGeneratorPort,
  ) {}

  async execute(command: LoginStaffCommand): Promise<StaffTokenResult> {
    const staff = await this.staffRepository.findByEmail(command.email);
    if (!staff || !staff.passwordHash) throw new InvalidStaffCredentialsException();

    const isValid = await this.hashingService.verify(command.password, staff.passwordHash);
    if (!isValid) throw new InvalidStaffCredentialsException();

    return this.issueToken(staff);
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