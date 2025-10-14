import { LeadSource } from '@prisma/client';
import {
  IsEmail,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsPositive,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateLeadDto {
  @IsString()
  @IsNotEmpty()
  company!: string;

  @IsOptional()
  @IsString()
  segment?: string;

  @IsOptional()
  @IsInt()
  @IsPositive()
  headcount?: number;

  @IsOptional()
  @IsString()
  contact?: string;

  @IsOptional()
  @IsPhoneNumber('BR')
  phone?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsEnum(LeadSource)
  source?: LeadSource;

  @IsString()
  @IsNotEmpty()
  statusId!: string;

  @IsString()
  @IsNotEmpty()
  ownerId!: string;
}

export class UpdateLeadStatusDto {
  @IsString()
  @IsNotEmpty()
  statusId!: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  tmkReason?: string;
}
