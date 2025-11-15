import { Injectable, NotFoundException } from '@nestjs/common';
import { STUDENTS } from '../mocks/data.mock';

@Injectable()
export class UsersService {
  async createDemoUser() {
    const user = STUDENTS[0];
    return Promise.resolve(user);
  }

  async findAll() {
    return Promise.resolve(STUDENTS);
  }

  async findById(id: string) {
    const u = STUDENTS.find((s) => s.id === id || s.studentId === id);
    if (!u) throw new NotFoundException('Student not found');
    return Promise.resolve(u);
  }

  async findByEmail(email: string) {
    const u = STUDENTS.find(
      (s) => s.eduMail === email || s.personalEmail === email,
    );
    return Promise.resolve(u || null);
  }

  async createFromGoogle(data: {
    email: string;
    name: string;
    picture?: string;
    googleId?: string;
  }) {
    const created = {
      id: `student-${Date.now()}`,
      fullName: data.name,
      studentId: `S${Math.floor(Math.random() * 10000)}`,
      eduMail: data.email,
      personalEmail: data.email,
      phoneNumber: '',
      program: '',
      faculty: '',
      year: 0,
      metadata: {},
    };
    return Promise.resolve(created);
  }
}
