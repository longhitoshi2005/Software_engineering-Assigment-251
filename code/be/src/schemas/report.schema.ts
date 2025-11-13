import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ReportTargetType } from './enums/report-target.enum';
import { ReportStatus } from './enums/report-status.enum';

export type ReportDocument = Report & Document;

@Schema({
  timestamps: true,
  collection: 'reports',
})
export class Report {
  // người gửi (student / tutor / user)
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  reporter: Types.ObjectId;

  // gửi về cái gì
  @Prop({ type: String, enum: ReportTargetType, required: true })
  targetType: ReportTargetType;

  // id của session / tutor / user
  @Prop({ type: Types.ObjectId, required: true })
  targetId: Types.ObjectId;

  // lý do chọn nhanh
  @Prop()
  reason?: string;

  // mô tả chi tiết
  @Prop()
  description?: string;

  // trạng thái xử lý
  @Prop({ type: String, enum: ReportStatus, default: ReportStatus.OPEN })
  status: ReportStatus;

  // ai xử lý (admin / coordinator)
  @Prop({ type: Types.ObjectId, ref: 'User', required: false })
  handledBy?: Types.ObjectId;
}

export const ReportSchema = SchemaFactory.createForClass(Report);
