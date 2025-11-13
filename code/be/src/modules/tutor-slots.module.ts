import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TutorSlot, TutorSlotSchema, Tutor, TutorSchema, User, UserSchema } from '../schemas';
import { TutorSlotsService, TutorsService, UsersService } from '../services';
import { TutorSlotsController } from '../controllers';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: TutorSlot.name, schema: TutorSlotSchema },
      { name: Tutor.name, schema: TutorSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [TutorSlotsController],
  providers: [TutorSlotsService, TutorsService, UsersService],
  exports: [TutorSlotsService],
})
export class TutorSlotsModule {}
