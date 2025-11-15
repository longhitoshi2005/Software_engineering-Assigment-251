import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

function readJson(fileName: string) {
  const p = path.join(__dirname, 'seed-data', fileName);
  if (!fs.existsSync(p)) return [];
  return JSON.parse(fs.readFileSync(p, 'utf-8'));
}

async function main() {
  await prisma.$transaction(async (tx: PrismaClient) => {
    console.log('Cleaning old data...');

    // Use Prisma model client names (camelCase of model name)
    await tx.conflict.deleteMany();
    await tx.tutorProfile.deleteMany();
    await tx.studentProfile.deleteMany();

    console.log('Old data cleaned.');
    console.log('Start seeding...');

    // Create students
    const students = readJson('students.json');
    const studentMap: Record<string, string> = {};
    for (const s of students) {
      const created = await tx.studentProfile.create({ data: s });
      if (s.studentId) studentMap[s.studentId] = created.id;
      if (s.eduMail) studentMap[s.eduMail] = created.id;
      console.log('Created studentProfile', created.id);
    }

    // Create tutors
    const tutors = readJson('tutors.json');
    const tutorMap: Record<string, string> = {};
    for (const t of tutors) {
      const created = await tx.tutorProfile.create({ data: t });
      if (t.tutorId) tutorMap[t.tutorId] = created.id;
      if (t.eduMail) tutorMap[t.eduMail] = created.id;
      console.log('Created tutorProfile', created.id);
    }

    // Create conflicts (link to tutor by eduMail or tutorId)
    const conflicts = readJson('conflicts.json');
    for (const c of conflicts) {
      const data: any = { ...c };
      if (c.detectedAt && typeof c.detectedAt === 'string')
        data.detectedAt = new Date(c.detectedAt);
      // link tutor if tutorEduMail or tutorId provided
      let tutorId: string | undefined;
      if (c.tutorEduMail) tutorId = tutorMap[c.tutorEduMail];
      if (!tutorId && c.tutorId) tutorId = tutorMap[c.tutorId];
      // Prisma model uses `tutorProfileId` as foreign key
      if (tutorId) data.tutorProfileId = tutorId;
      delete data.tutorEduMail;

      try {
        const created = await tx.conflict.create({ data });
        console.log('Created conflict', created.id);
      } catch (err) {
        console.warn('Failed to create conflict', err);
      }
    }
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
