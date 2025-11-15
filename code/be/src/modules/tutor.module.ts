import { Module } from '@nestjs/common';
import { TutorsController } from '../controllers/tutors.controller';
import { TutorsService } from '../services/tutors.service';
import { UsersService } from '../services/users.service';

@Module({
  controllers: [TutorsController],
  providers: [TutorsService, UsersService],
  exports: [TutorsService],
})
export class TutorsModule {}
