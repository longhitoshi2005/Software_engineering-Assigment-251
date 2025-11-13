import {
  IsEnum,
  IsMongoId,
  IsOptional,
  IsString,
} from 'class-validator';
import { ReportTargetType } from 'src/schemas';

export class CreateReportDto {
  @IsEnum(ReportTargetType)
  targetType: ReportTargetType;

  @IsMongoId()
  targetId: string;

  @IsOptional()
  @IsString()
  reason?: string;

  @IsOptional()
  @IsString()
  description?: string;
}