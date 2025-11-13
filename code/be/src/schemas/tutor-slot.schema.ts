import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { TutorSlotStatus } from './enums/tutor-slot-status.enum';

export type TutorSlotDocument = TutorSlot & Document;

@Schema({
  timestamps: true,
  collection: 'tutor_slots',
})
export class TutorSlot {
  // Slot này thuộc về tutor nào
  @Prop({ type: Types.ObjectId, ref: 'Tutor', required: true })
  tutor: Types.ObjectId;

  // Thời gian bắt đầu
  @Prop({ type: Date, required: true })
  startTime: Date;

  // Thời gian kết thúc
  @Prop({ type: Date, required: true })
  endTime: Date;

  // Ví dụ: CO2013, OOP, DSA...
  @Prop()
  subject?: string;

  // Trạng thái của slot
  @Prop({
    type: String,
    enum: TutorSlotStatus,
    default: TutorSlotStatus.AVAILABLE,
  })
  status: TutorSlotStatus;

  // Nếu slot đã được book → gắn student ở đây
  @Prop({ type: Types.ObjectId, ref: 'User', required: false })
  bookedBy?: Types.ObjectId;
}

export const TutorSlotSchema = SchemaFactory.createForClass(TutorSlot);
