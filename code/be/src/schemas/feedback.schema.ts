import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type FeedbackDocument = Feedback & Document;

@Schema({
  timestamps: true,
  collection: 'feedbacks',
})
export class Feedback {
  // buổi học nào
  @Prop({ type: Types.ObjectId, ref: 'Session', required: true, index: true })
  session: Types.ObjectId;

  // ai gửi (student)
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  student: Types.ObjectId;

  // tutor được đánh giá
  @Prop({ type: Types.ObjectId, ref: 'Tutor', required: true, index: true })
  tutor: Types.ObjectId;

  // điểm 1-5
  @Prop({ type: Number, min: 1, max: 5, required: true })
  rating: number;

  // nhận xét
  @Prop()
  comment?: string;
}

export const FeedbackSchema = SchemaFactory.createForClass(Feedback);
