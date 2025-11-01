import type { Prisma as PrismaTypes } from '@prisma/client';
import PrismaPkg from '@prisma/client';
import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

const { ImplStatus } = PrismaPkg;

export class UpdateImplementationDto {
  @IsOptional()
  @IsEnum(ImplStatus)
  status?: PrismaTypes.ImplStatus;

  @IsOptional()
  @IsDateString()
  schedule?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;

  @IsNotEmpty()
  @IsString()
  actorId!: string;
}
