import { Channel, Role } from '../../database/enums.js';
import {
  IsDateString,
  IsEmail,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

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

class PricingItemDto {
  @IsString()
  @IsNotEmpty()
  sku!: string;

  @IsOptional()
  @IsInt()
  quantity?: number;
}

export class CreateOpportunityDto {
  @IsOptional()
  @IsString()
  leadId?: string;

  @IsString()
  @IsNotEmpty()
  ownerId!: string;

  @IsString()
  @IsNotEmpty()
  stageId!: string;

  @IsOptional()
  @IsString()
  legalName?: string;

  @IsOptional()
  @IsString()
  cnpj?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsEmail()
  finEmail?: string;

  @IsOptional()
  @IsString()
  finOwner?: string;

  @IsOptional()
  @IsString()
  finPhone?: string;

  @IsOptional()
  @IsEmail()
  contactEmail?: string;

  @IsOptional()
  @IsString()
  contactOwner?: string;

  @IsOptional()
  @IsString()
  contactPhone?: string;

  @IsOptional()
  @IsString()
  subdomain?: string;

  @IsOptional()
  @IsInt()
  users?: number;

  @IsOptional()
  @IsInt()
  whatsapp?: number;

  @IsOptional()
  @IsInt()
  instagram?: number;

  @IsOptional()
  @IsInt()
  facebook?: number;

  @IsOptional()
  @IsInt()
  waba?: number;

  @IsOptional()
  @ValidateNested()
  @Type(() => ModuleFlagsDto)
  modules?: ModuleFlagsDto;

  @IsOptional()
  @IsString()
  hostingId?: string;

  @IsOptional()
  @IsString()
  serverIp?: string;

  @IsOptional()
  @IsDateString()
  trialStart?: string;

  @IsOptional()
  @IsDateString()
  activation?: string;

  @IsOptional()
  @IsInt()
  billingBaseDay?: number;
}

export class UpdateOppStageDto {
  @IsString()
  @IsNotEmpty()
  stageId!: string;

  @IsString()
  @IsNotEmpty()
  actorId!: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;
}

export class ApplyPricingDto {
  @IsEnum(Channel)
  channel!: Channel;

  @ValidateNested({ each: true })
  @Type(() => PricingItemDto)
  items!: PricingItemDto[];

  @IsOptional()
  @IsEnum(Role)
  role?: Role;

  @IsOptional()
  @IsNumber()
  discountPct?: number;

  @IsOptional()
  @IsInt()
  users?: number;
}

export class MarkOpportunityLostDto {
  @IsString()
  @IsNotEmpty()
  actorId!: string;

  @IsString()
  @IsNotEmpty()
  reason!: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  summary?: string;
}
