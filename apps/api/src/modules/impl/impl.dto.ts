import { ImplStatus } from '../../database/enums.js';
import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class UpdateImplementationDto {
  @IsOptional()
  @IsEnum(ImplStatus)
  status?: ImplStatus;

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
