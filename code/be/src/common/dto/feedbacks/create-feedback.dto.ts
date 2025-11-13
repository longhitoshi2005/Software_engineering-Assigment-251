import {
  IsInt,
  IsMongoId,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class CreateFeedbackDto {
  @IsMongoId()
  sessionId: string;

  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @IsOptional()
  @IsString()
  comment?: string;
}
