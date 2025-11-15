import { Injectable, NotFoundException } from '@nestjs/common';
import { TUTORS } from '../mocks/data.mock';

@Injectable()
export class TutorsService {
  async findAll() {
    return Promise.resolve(
      TUTORS.map((t) => ({
        id: t.id,
        fullName: t.fullName,
        tutorId: t.tutorId,
        eduMail: t.eduMail,
        expertise: t.expertise,
        currentLoad: t.currentLoad,
        profileSummary: t.profileSummary,
      })),
    );
  }

  async findPublicList() {
    return this.findAll();
  }

  async findById(id: string) {
    const t = TUTORS.find((x) => x.id === id || x.tutorId === id);
    if (!t) throw new NotFoundException('Tutor not found');
    return Promise.resolve(t);
  }

  async getSchedule(tutorId: string) {
    const t = TUTORS.find((x) => x.id === tutorId || x.tutorId === tutorId);
    if (!t) throw new NotFoundException('Tutor not found');
    return Promise.resolve({
      availability: t.availability,
      currentLoad: t.currentLoad,
    });
  }
}
