// src/services/users.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Role, User, UserDocument } from '../schemas';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async createDemoUser() {
    const existed = await this.userModel.findOne({
      academicEmail: '2352525@hcmut.edu.vn',
    });
    if (existed) return existed;

    const created = new this.userModel({
      fullName: 'Nguyen Manh Quoc Khanh',
      academicEmail: '2352525@hcmut.edu.vn',
      role: 'student',
      studentId: '2352525',
      faculty: 'CSE',
    });
    return created.save();
  }

  async findAll() {
    return this.userModel.find().lean();
  }

  async findById(id: string) {
    const user = await this.userModel.findById(id).lean();
    return user;
  }

  async findByEmail(email: string) {
    return this.userModel.findOne({ academicEmail: email }).lean();
  }

   async createFromGoogle(data: {
    email: string;
    name: string;
    picture?: string;
    googleId?: string;
  }) {
    const created = new this.userModel({
      fullName: data.name,
      academicEmail: data.email,
      avatar: data.picture,
      role: Role.STUDENT,
      googleId: data.googleId,
    });
    return created.save();
  }

}
