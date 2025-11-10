import { Channel, ItemKind, Role } from '../../database/enums.js';

type ChannelType = typeof Channel[keyof typeof Channel];
type ItemKindType = typeof ItemKind[keyof typeof ItemKind];
type RoleType = typeof Role[keyof typeof Role];
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
