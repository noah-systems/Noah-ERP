import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsPositive, IsString, MaxLength } from 'class-validator';
import type { PartnerAccountStatus as PartnerAccountStatusType } from '@prisma/client';
import PrismaPkg from '@prisma/client';

const { PartnerAccountStatus } = PrismaPkg;

class ModuleFlagsDto {
  @IsOptional()
  campaign?: boolean;

  @IsOptional()
  crm?: boolean;

  @IsOptional()
  voip?: boolean;

  @IsOptional()
  glpi?: boolean;
}

export class CreatePartnerDto {
  @IsString()
  @IsNotEmpty()
  legalName!: string;

  @IsString()
  @IsNotEmpty()
  cnpj!: string;

  @IsString()
  @IsNotEmpty()
  nickname!: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  contact?: string;

  @IsOptional()
  @IsString()
  whatsapp?: string;

  @IsOptional()
  @IsString()
  financeEmail?: string;

  @IsOptional()
  @IsString()
  domain?: string;

  @IsOptional()
  priceTable?: Record<string, unknown>;
}

export class CreatePartnerAccountDto {
  @IsString()
  @IsNotEmpty()
  legalName!: string;

  @IsString()
  @IsNotEmpty()
  cnpj!: string;

  @IsString()
  @IsNotEmpty()
  email!: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsString()
  @IsNotEmpty()
  subdomain!: string;

  @IsInt()
  @IsPositive()
  users!: number;

  @IsOptional()
  connections?: Record<string, unknown>;

  @IsOptional()
  modules?: ModuleFlagsDto;

  @IsOptional()
  @IsString()
  hostingId?: string;

  @IsOptional()
  @IsString()
  serverIp?: string;

  @IsOptional()
  @IsInt()
  billingBaseDay?: number;
}

export class CreateChangeRequestDto {
  @IsString()
  @IsNotEmpty()
  type!: string;

  @IsOptional()
  payload?: Record<string, unknown>;
}

export class ResolveChangeDto {
  @IsEnum(PartnerAccountStatus)
  status!: PartnerAccountStatusType;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;
}
