import type {
  Channel as ChannelType,
  ItemKind as ItemKindType,
  Role as RoleType,
} from '@prisma/client';
import PrismaPkg from '@prisma/client';
import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';

const { Channel, ItemKind, Role } = PrismaPkg;

export class CreatePriceItemDto {
  @IsString()
  @IsNotEmpty()
  sku!: string;

  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsNumber()
  @IsPositive()
  price!: number;

  @IsEnum(Channel)
  channel!: ChannelType;

  @IsEnum(ItemKind)
  kind!: ItemKindType;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}

export class CreatePriceTierDto {
  @IsEnum(Channel)
  channel!: ChannelType;

  @IsPositive()
  minUsers!: number;

  @IsOptional()
  @IsPositive()
  maxUsers?: number;

  @IsNumber()
  @IsPositive()
  pricePerUser!: number;
}

export class CreateDiscountPolicyDto {
  @IsEnum(Role)
  role!: RoleType;

  @IsNumber()
  @IsPositive()
  maxPercent!: number;
}
