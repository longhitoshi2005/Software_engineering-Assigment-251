import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { TutorSlot, TutorSlotDocument, TutorSlotStatus } from '../schemas';

@Injectable()
export class TutorSlotsService {
  constructor(
    @InjectModel(TutorSlot.name) private slotModel: Model<TutorSlotDocument>,
  ) {}

  // tutor tạo slot mới
  async createSlot(tutorId: string, data: { startTime: Date; endTime: Date; subject?: string }) {
    // kiểm tra trùng giờ với slot cùng tutor
    const overlap = await this.slotModel.findOne({
      tutor: new Types.ObjectId(tutorId),
      $or: [
        { startTime: { $lt: data.endTime }, endTime: { $gt: data.startTime } },
      ],
      status: { $ne: TutorSlotStatus.CANCELLED },
    });

    if (overlap) {
      throw new BadRequestException('This time overlaps with another slot');
    }

    const slot = new this.slotModel({
      tutor: new Types.ObjectId(tutorId),
      startTime: data.startTime,
      endTime: data.endTime,
      subject: data.subject,
      status: TutorSlotStatus.AVAILABLE,
    });

    return slot.save();
  }

  // tutor xem slot của mình
  async findByTutor(tutorId: string) {
    const oid = new Types.ObjectId(tutorId);
    return this.slotModel
      .find({ tutor: oid })
      .sort({ startTime: 1 })
      .lean();
  }

  // student xem slot khả dụng của tutor
  async findAvailableSlots(tutorId?: string) {
    const filter: any = { status: TutorSlotStatus.AVAILABLE };
    if (tutorId) {
      filter.tutor = new Types.ObjectId(tutorId);
    }

    return this.slotModel
      .find(filter)
      .populate('tutor')
      .sort({ startTime: 1 })
      .lean();
  }

  // tutor hoặc admin hủy slot
  async cancelSlot(slotId: string, requesterRole: string) {
    const slot = await this.slotModel.findById(slotId);
    if (!slot) throw new NotFoundException('Slot not found');
    if (slot.status === TutorSlotStatus.BOOKED) {
      throw new ForbiddenException('Cannot cancel a booked slot');
    }

    slot.status = TutorSlotStatus.CANCELLED;
    return slot.save();
  }
}
