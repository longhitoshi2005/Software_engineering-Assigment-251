import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { SessionStatus } from './enums/session-status.enum';
export type SessionDocument = Session & Document;


@Schema({
  timestamps: true,
  collection: 'sessions',
})
export class Session {
  // ai đặt (student) → users._id
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  student: Types.ObjectId;

  // đặt với tutor nào → tutors._id (hoặc user tutor, nhưng mình chọn tutors)
  @Prop({ type: Types.ObjectId, ref: 'Tutor', required: true })
  tutor: Types.ObjectId;

  // thời gian bắt đầu buổi học
  @Prop({ type: Date, required: true })
  startTime: Date;

  // thời gian kết thúc buổi học
  @Prop({ type: Date, required: true })
  endTime: Date;

  // môn / học phần cần hỗ trợ
  @Prop()
  subject?: string;

  // ghi chú của student
  @Prop()
  note?: string;

  // trạng thái
  @Prop({ enum: SessionStatus, default: SessionStatus.PENDING })
  status: SessionStatus;
}

export const SessionSchema = SchemaFactory.createForClass(Session);
