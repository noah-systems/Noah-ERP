import { Channel, ItemKind, Role } from '@prisma/client';
import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';

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
  channel!: Channel;

  @IsEnum(ItemKind)
  kind!: ItemKind;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}

export class CreatePriceTierDto {
  @IsEnum(Channel)
  channel!: Channel;

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
  role!: Role;

  @IsNumber()
  @IsPositive()
  maxPercent!: number;
}
