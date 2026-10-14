import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Put,
} from '@nestjs/common';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../../../../common/decorators/current-user.decorator';
import { UpdatePatientProfileRequestDto, PatientProfileResponseDto } from './presentation/dto/patient.dto';
import type { GetPatientProfileUseCase } from '../../application/use-cases/get-patient-profile.use-case';
import type { UpdatePatientProfileUseCase } from '../../application/use-cases/update-patient-profile.use-case';
import type { DeletePatientAccountUseCase } from '../../application/use-cases/delete-patient-account.use-case';

@Controller('patients')
export class PatientsController {
  constructor(
    private readonly getProfileUseCase: GetPatientProfileUseCase,
    private readonly updateProfileUseCase: UpdatePatientProfileUseCase,
    private readonly deleteAccountUseCase: DeletePatientAccountUseCase,
  ) {}

  @Get('profile')
  async getProfile(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<PatientProfileResponseDto> {
    return this.getProfileUseCase.execute({ userId: user.id });
  }

  @Put('profile')
  async updateProfile(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdatePatientProfileRequestDto,
  ): Promise<PatientProfileResponseDto> {
    return this.updateProfileUseCase.execute({
      userId: user.id,
      fullName: dto.fullName,
      birthDate: dto.birthDate,
      bloodType: dto.bloodType,
      weightKg: dto.weightKg,
      heightCm: dto.heightCm,
      cpf: dto.cpf,
      phone: dto.phone,
      address: dto.address,
    });
  }

  @Delete('account')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteAccount(@CurrentUser() user: AuthenticatedUser): Promise<void> {
    await this.deleteAccountUseCase.execute({ userId: user.id });
  }
}