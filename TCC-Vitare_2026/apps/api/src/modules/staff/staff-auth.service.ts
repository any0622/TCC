import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Staff } from '../../../generated/prisma/client';
import { hashPassword, verifyPassword } from '../../common/utils/hash.util';
import { StaffRepository } from './repositories/staff.repository';

@Injectable()
export class StaffAuthService {
  constructor(
    private readonly staffRepository: StaffRepository,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  async register(
    fullName: string,
    email: string,
    cpf: string,
    registrationNumber: string,
    role: string,
    password: string,
  ) {
    const existing = await this.staffRepository.findByEmail(email);
    if (existing) throw new UnauthorizedException('E-mail já cadastrado');

    const passwordHash = await hashPassword(password);
    const staff = await this.staffRepository.create({
      fullName,
      email,
      cpf,
      registrationNumber,
      role: 'MEDICO_SOCORRISTA',
      passwordHash,
    });
    return this.issueToken(staff);
  }

  async bootstrapAdmin(
    fullName: string,
    email: string,
    cpf: string,
    registrationNumber: string,
    password: string,
  ) {
    const existing = await this.staffRepository.findByEmail(email);
    if (existing) throw new UnauthorizedException('E-mail já cadastrado');

    const passwordHash = await hashPassword(password);
    const staff = await this.staffRepository.create({
      fullName,
      email,
      cpf,
      registrationNumber,
      role: 'ADMINISTRATIVO',
      passwordHash,
    });
    return this.issueToken(staff);
  }

  async checkAnyStaffExists(): Promise<boolean> {
    const staff = await this.staffRepository.findAny();
    return !!staff;
  }

  async login(email: string, password: string) {
    const staff = await this.staffRepository.findByEmail(email);
    if (!staff) throw new UnauthorizedException('E-mail ou senha inválidos');
    if (!staff?.passwordHash) return null;
    const isValid = await verifyPassword(password, staff.passwordHash);
    if (!isValid) throw new UnauthorizedException('E-mail ou senha inválidos');

    return this.issueToken(staff);
  }

  async me(id: string) {
    const staff = await this.staffRepository.findById(id);
    if (!staff) {
      throw new UnauthorizedException('Credencial de staff inválida');
    }

    return this.serializeStaff(staff);
  }

  private issueToken(staff: Staff) {
    const staffData = this.serializeStaff(staff);
    const accessToken = this.jwtService.sign(
      { sub: staff.id, email: staff.email, type: 'staff', role: staff.role },
      {
        secret: this.config.get<string>('STAFF_JWT_SECRET'),
        expiresIn: this.config.get<string>(
          'STAFF_JWT_EXPIRES_IN',
        ) as `${number}${'s' | 'm' | 'h' | 'd'}`,
      },
    );

    return {
      accessToken,
      staff: staffData,
    };
  }

  private serializeStaff(staff: Staff) {
    return {
      id: staff.id,
      fullName: staff.fullName,
      email: staff.email,
      cpf: staff.cpf,
      registrationNumber: staff.registrationNumber,
      role: staff.role,
    };
  }
}
