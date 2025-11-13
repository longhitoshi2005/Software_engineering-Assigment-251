import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Session, SessionDocument, SessionStatus, TutorSlot, TutorSlotDocument, TutorSlotStatus } from '../schemas';

@Injectable()
export class SessionsService {
  constructor(
    @InjectModel(Session.name) 
    private sessionModel: Model<SessionDocument>,

    @InjectModel(TutorSlot.name)
    private slotMode: Model<TutorSlotDocument>,
  ) {}

  async bookSlot(studentId: string, slotId: string, note?: string) {
    const slot = await this.slotMode.findById(slotId);

    if (!slot) {
      throw new NotFoundException('Slot not found');
    }

    if (slot.status !== TutorSlotStatus.AVAILABLE) {
      throw new BadRequestException('Slot is not available');
    }

    const tutorId = slot.tutor as unknown as Types.ObjectId;

    slot.status = TutorSlotStatus.BOOKED;
    slot.bookedBy = new Types.ObjectId(studentId);
    await slot.save();

    const session = new this.sessionModel({
      student: new Types.ObjectId(studentId),
      tutor: tutorId,
      startTime: slot.startTime,
      endTime: slot.endTime,
      subject: slot.subject,
      note,
      status: SessionStatus.PENDING,
    });

    return session.save();
  }

  async findByStudent(studentId: string) {
    return this.sessionModel
      .find({ student: new Types.ObjectId(studentId) })
      .populate(['tutor', 'student'])
      .sort({ startTime: -1 })
      .lean();
  }

  async findByTutor(tutorId: string) {
    return this.sessionModel
      .find({ tutor: new Types.ObjectId(tutorId) })
      .populate(['student', 'tutor'])
      .sort({ startTime: -1 })
      .lean();
  }

  async updateStatus(sessionId: string, status: SessionStatus) {
    const updated = await this.sessionModel.findByIdAndUpdate(
      sessionId,
      { status },
      { new: true },
    );
    if (!updated) throw new NotFoundException('Session not found');
    return updated;
  }
}
