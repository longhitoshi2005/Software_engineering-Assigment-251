import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type TutorDocument = Tutor & Document;

@Schema({
  timestamps: true,
  collection: 'tutors',
})
export class Tutor {
  // liên kết tới user gốc
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, unique: true })
  user: Types.ObjectId;

  // các môn / học phần mà tutor hỗ trợ
  @Prop({ type: [String], default: [] })
  subjects: string[];

  // ví dụ: ["CO3093", "CO2013"]
  @Prop({ type: [String], default: [] })
  courseCodes: string[];

  // mô tả ngắn để sinh viên biết nên book ai
  @Prop()
  bio?: string;

  // để show điểm đánh giá
  @Prop({ default: 0 })
  rating: number;

  // số buổi dạy để tính rating trung bình
  @Prop({ default: 0 })
  totalSessions: number;

  // trạng thái hoạt động
  @Prop({ default: true })
  isActive: boolean;
}

export const TutorSchema = SchemaFactory.createForClass(Tutor);
