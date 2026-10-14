import { IsOptional, IsNumber, Min, Max } from 'class-validator';

export class TriggerEmergencyRequestDto {
  @IsOptional()
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude?: number;

  @IsOptional()
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude?: number;
}

export class EmergencyResponseDto {
  id!: string;
  userId!: string;
  triggeredAt!: Date;
  latitude!: number | null;
  longitude!: number | null;
  patientSnapshot!: any;
  status!: 'TRIGGERED' | 'NOTIFIED' | 'RESOLVED';
  notes!: string | null;
}

export class CursorPaginatedEmergencyResponseDto {
  data!: EmergencyResponseDto[];
  nextCursor!: string | null;
  hasMore!: boolean;
}