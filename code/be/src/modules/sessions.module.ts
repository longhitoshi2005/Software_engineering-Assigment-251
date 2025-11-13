import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Session, SessionSchema, Tutor, TutorSchema, TutorSlot, TutorSlotSchema, User, UserSchema } from '../schemas';
import { SessionsController } from 'src/controllers';
import { SessionsService, TutorsService, UsersService } from '../services';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Session.name, schema: SessionSchema },
      { name: Tutor.name, schema: TutorSchema },
      { name: User.name, schema: UserSchema },
      { name: TutorSlot.name, schema: TutorSlotSchema },
    ]),
  ],
  controllers: [SessionsController],
  providers: [SessionsService, TutorsService, UsersService],
  exports: [SessionsService],
})
export class SessionsModule {}
