import { IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class CompleteImplementationTaskDto {
  @IsUUID()
  performedById!: string;

  @IsOptional()
  @IsString()
  @MaxLength(2048)
  notes?: string;
}
