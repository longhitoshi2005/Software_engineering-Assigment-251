import { IsMongoId, IsOptional, IsString } from 'class-validator';

export class CreateSessionDto {
  @IsMongoId()
  slotId: string; // ObjectId của TutorSlot

  @IsOptional()
  @IsString()
  note?: string;
}
