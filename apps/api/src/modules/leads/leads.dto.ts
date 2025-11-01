import { LeadSource } from '@prisma/client';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  IsInt,
  Min,
} from 'class-validator';

export class CreateLeadDto {
  @IsString() @IsNotEmpty()
  company!: string;

  @IsOptional() @IsString()
  segment?: string | null;

  @IsOptional() @IsInt() @Min(1)
  headcount?: number;

  @IsOptional() @IsString()
  contact?: string | null;

  @IsOptional() @IsString()
  phone?: string | null;

  @IsOptional() @IsEmail()
  email?: string | null;

  @IsOptional() @IsString()
  notes?: string | null;

  @IsOptional() @IsEnum(LeadSource)
  source?: LeadSource;

  @IsUUID() @IsNotEmpty()
  statusId!: string;

  @IsUUID() @IsNotEmpty()
  ownerId!: string;
}

export class UpdateLeadStatusDto {
  @IsUUID() @IsNotEmpty()
  statusId!: string;

  @IsOptional() @IsString()
  notes?: string | null;
}
