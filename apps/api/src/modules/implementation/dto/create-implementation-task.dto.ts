import { IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class CreateImplementationTaskDto {
  @IsUUID()
  accountId!: string;

  @IsString()
  @MaxLength(255)
  domain!: string;

  @IsUUID()
  createdById!: string;

  @IsOptional()
  @IsString()
  @MaxLength(2048)
  notes?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  segment?: string;
}
