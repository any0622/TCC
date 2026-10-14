import { IsLatitude, IsLongitude, IsOptional } from 'class-validator';

export class TriggerEmergencyDto {
  @IsOptional()
  @IsLatitude()
  latitude?: number;

  @IsOptional()
  @IsLongitude()
  longitude?: number;
}
