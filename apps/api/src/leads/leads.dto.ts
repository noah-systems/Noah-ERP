import { Type } from 'class-transformer';
import { IsEmail, IsEnum, IsOptional, IsString, IsUUID, IsNumber, IsNotEmpty } from 'class-validator';
import { LeadStatusValue } from '../database/models/lead.model.js';

type LeadStatusType = typeof LeadStatusValue[keyof typeof LeadStatusValue];

export class LeadsQueryDto {
  @IsOptional()
  @IsString()
  q?: string;
}

export class CreateLeadDto {
  @IsString()
  @IsNotEmpty()
  companyName!: string;

  @IsOptional()
  @IsString()
  segment?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  employeesCount?: number;

  @IsOptional()
  @IsString()
  contactName?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  source?: string;

  @IsOptional()
  @IsUUID()
  ownerId?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateLeadDto {
  @IsOptional()
  @IsString()
  companyName?: string;

  @IsOptional()
  @IsString()
  segment?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  employeesCount?: number;

  @IsOptional()
  @IsString()
  contactName?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  source?: string;

  @IsOptional()
  @IsUUID()
  ownerId?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class MoveLeadDto {
  @IsEnum(LeadStatusValue)
  status!: LeadStatusType;
}
