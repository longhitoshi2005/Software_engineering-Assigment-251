import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Report,
  ReportSchema,
  Session,
  SessionSchema,
  Tutor,
  TutorSchema,
  User,
  UserSchema,
} from '../schemas';
import { ReportsService } from '../services/reports.service';
import { ReportsController } from '../controllers/reports.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Report.name, schema: ReportSchema },
      { name: Session.name, schema: SessionSchema },
      { name: Tutor.name, schema: TutorSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [ReportsController],
  providers: [ReportsService],
  exports: [ReportsService],
})
export class ReportsModule {}
