import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  Report,
  ReportDocument,
  ReportTargetType,
  ReportStatus,
  Session,
  SessionDocument,
  Tutor,
  TutorDocument,
  User,
  UserDocument,
} from '../schemas';

@Injectable()
export class ReportsService {
  constructor(
    @InjectModel(Report.name) private reportModel: Model<ReportDocument>,
    @InjectModel(Session.name) private sessionModel: Model<SessionDocument>,
    @InjectModel(Tutor.name) private tutorModel: Model<TutorDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  // user gửi report
  async createReport(reporterId: string, dto: {
    targetType: ReportTargetType;
    targetId: string;
    reason?: string;
    description?: string;
  }) {
    // validate target
    const targetObjectId = new Types.ObjectId(dto.targetId);

    if (dto.targetType === ReportTargetType.SESSION) {
      const s = await this.sessionModel.findById(targetObjectId);
      if (!s) throw new NotFoundException('Session not found');
    } else if (dto.targetType === ReportTargetType.TUTOR) {
      const t = await this.tutorModel.findById(targetObjectId);
      if (!t) throw new NotFoundException('Tutor not found');
    } else if (dto.targetType === ReportTargetType.USER) {
      const u = await this.userModel.findById(targetObjectId);
      if (!u) throw new NotFoundException('User not found');
    } else {
      throw new BadRequestException('Invalid target type');
    }

    const report = new this.reportModel({
      reporter: new Types.ObjectId(reporterId),
      targetType: dto.targetType,
      targetId: targetObjectId,
      reason: dto.reason,
      description: dto.description,
      status: ReportStatus.OPEN,
    });

    return report.save();
  }

  // admin / coordinator xem toàn bộ report
  async findAll() {
    return this.reportModel
      .find()
      .populate('reporter')
      .sort({ createdAt: -1 })
      .lean();
  }

  // admin / coordinator cập nhật trạng thái
  async updateStatus(reportId: string, handlerId: string, status: ReportStatus) {
    const updated = await this.reportModel.findByIdAndUpdate(
      reportId,
      {
        status,
        handledBy: new Types.ObjectId(handlerId),
      },
      { new: true },
    );

    if (!updated) throw new NotFoundException('Report not found');
    return updated;
  }
}
