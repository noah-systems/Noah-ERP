import { IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class MarkUnsuccessfulImplementationTaskDto {
  @IsUUID()
  performedById!: string;

  @IsOptional()
  @IsString()
  @MaxLength(2048)
  notes?: string;
}
