import { IsDateString, IsOptional, IsString } from 'class-validator';

export class CreateTutorSlotDto {
  @IsDateString()
  startTime: string; // ISO 8601, ví dụ "2025-11-05T09:00:00.000Z"

  @IsDateString()
  endTime: string;

  @IsOptional()
  @IsString()
  subject?: string;
}