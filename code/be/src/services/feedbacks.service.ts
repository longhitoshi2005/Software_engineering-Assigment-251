import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  Feedback,
  FeedbackDocument,
  Session,
  SessionDocument,
  SessionStatus,
} from '../schemas';

@Injectable()
export class FeedbacksService {
  constructor(
    @InjectModel(Feedback.name)
    private fbModel: Model<FeedbackDocument>,
    @InjectModel(Session.name)
    private sessionModel: Model<SessionDocument>,
  ) {}

  // student gửi feedback cho 1 buổi học
  async createFeedback(studentId: string, dto: {
    sessionId: string;
    rating: number;
    comment?: string;
  }) {
    const session = await this.sessionModel.findById(dto.sessionId);

    if (!session) throw new NotFoundException('Session not found');

    // chỉ đúng student mới được gửi
    if (session.student.toString() !== studentId) {
      throw new BadRequestException('You are not the student of this session');
    }

    // chỉ cho feedback nếu buổi học đã done/approved
    if (
      ![SessionStatus.DONE, SessionStatus.APPROVED].includes(session.status)
    ) {
      throw new BadRequestException('Session is not finished yet');
    }

    // check đã feedback chưa
    const existed = await this.fbModel.findOne({
      session: session._id,
      student: new Types.ObjectId(studentId),
    });
    if (existed) {
      throw new BadRequestException('You already sent feedback for this session');
    }

    const fb = new this.fbModel({
      session: session._id,
      student: new Types.ObjectId(studentId),
      tutor: session.tutor,
      rating: dto.rating,
      comment: dto.comment,
    });

    return fb.save();
  }

  // xem feedback của 1 tutor
  async getFeedbacksOfTutor(tutorId: string) {
    return this.fbModel
      .find({ tutor: new Types.ObjectId(tutorId) })
      .populate(['student', 'session'])
      .sort({ createdAt: -1 })
      .lean();
  }
}
