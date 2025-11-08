import { Transform } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsUUID, Max, Min } from 'class-validator';
import { ImplementationTaskStatus } from '../models/implementation-task.model.js';

function toInteger(value: unknown): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.trunc(parsed) : 0;
}

export class MoveImplementationTaskDto {
  @IsEnum(ImplementationTaskStatus)
  status!: ImplementationTaskStatus;

  @Transform(({ value }) => Math.max(0, toInteger(value)))
  @IsInt()
  @Min(0)
  @Max(100000)
  position!: number;

  @IsOptional()
  @IsUUID()
  performedById?: string;
}
