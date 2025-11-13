import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Tutor, TutorDocument } from '../schemas';
import { UsersService } from '../services';

@Injectable()
export class TutorsService {
  constructor(
    @InjectModel(Tutor.name) private tutorModel: Model<TutorDocument>,
    private readonly usersService: UsersService,
  ) {}

  /**
   * Tạo profile tutor cho 1 user đã tồn tại
   */
  async createForUser(userId: string, payload: {
    subjects?: string[];
    courseCodes?: string[];
    bio?: string;
  }) {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const existed = await this.tutorModel.findOne({ user: user._id });
    if (existed) {
      throw new BadRequestException('Tutor profile already exists for this user');
    }

    const tutor = new this.tutorModel({
      user: user._id,
      subjects: payload.subjects ?? [],
      courseCodes: payload.courseCodes ?? [],
      bio: payload.bio ?? '',
    });

    return tutor.save();
  }

  async findAll() {
    return this.tutorModel
      .find()
      .populate('user') // để frontend hiện tên luôn
      .lean();
  }

  async findByUserId(userId: string) {
    return this.tutorModel
      .findOne({ user: new Types.ObjectId(userId) })
      .populate('user')
      .lean();
  }

  async updateByUserId(userId: string, payload: Partial<Tutor>) {
    const tutor = await this.tutorModel.findOneAndUpdate(
      { user: new Types.ObjectId(userId) },
      { $set: payload },
      { new: true },
    );

    if (!tutor) {
      throw new NotFoundException('Tutor not found for this user');
    }

    return tutor;
  }

  async deleteByUserId(userId: string) {
    return this.tutorModel.findOneAndDelete({ user: new Types.ObjectId(userId) });
  }
}
