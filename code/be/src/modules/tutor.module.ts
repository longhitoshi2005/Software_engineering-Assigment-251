import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TutorsController } from '../controllers/tutors.controller';
import { TutorsService, UsersService } from '../services';
import { Tutor, TutorSchema, User, UserSchema } from '../schemas';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Tutor.name, schema: TutorSchema },
    ]),
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [TutorsController],
  providers: [TutorsService, UsersService],
  exports: [TutorsService],
})
export class TutorsModule {}
