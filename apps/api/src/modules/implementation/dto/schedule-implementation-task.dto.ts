import { IsDateString, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class ScheduleImplementationTaskDto {
  @IsDateString()
  scheduledAt!: string;

  @IsUUID()
  assigneeId!: string;

  @IsUUID()
  performedById!: string;

  @IsOptional()
  @IsString()
  @MaxLength(2048)
  notes?: string;
}
