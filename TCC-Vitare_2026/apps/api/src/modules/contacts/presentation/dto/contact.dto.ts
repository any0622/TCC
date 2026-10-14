import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateContactRequestDto {
  @IsString()
  @MaxLength(255)
  name!: string;

  @IsString()
  @MaxLength(30)
  phone!: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  relationship?: string;

  @IsOptional()
  isPrimary?: boolean;
}

export class ContactResponseDto {
  id!: string;
  userId!: string;
  name!: string;
  phone!: string;
  relationship!: string | null;
  isPrimary!: boolean;
  createdAt!: Date;
}