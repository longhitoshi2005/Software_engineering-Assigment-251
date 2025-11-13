import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Feedback,
  FeedbackSchema,
  Session,
  SessionSchema,
} from '../schemas';
import { FeedbacksService } from '../services/feedbacks.service';
import { FeedbacksController } from '../controllers/feedbacks.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Feedback.name, schema: FeedbackSchema },
      { name: Session.name, schema: SessionSchema },
    ]),
  ],
  controllers: [FeedbacksController],
  providers: [FeedbacksService],
  exports: [FeedbacksService],
})
export class FeedbacksModule {}
