import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { FeedbacksService } from '../services/feedbacks.service';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';
import { Role } from '../schemas';
import { CreateFeedbackDto } from 'src/common/dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('feedbacks')
@ApiBearerAuth('access-token')
@Controller('feedbacks')
export class FeedbacksController {
  constructor(private readonly feedbacksService: FeedbacksService) {}

  // student gửi feedback
  @Roles(Role.STUDENT)
  @Post()
  async create(
    @CurrentUser('sub') studentId: string,
    @Body() dto: CreateFeedbackDto,
  ) {
    return this.feedbacksService.createFeedback(studentId, {
      sessionId: dto.sessionId,
      rating: dto.rating,
      comment: dto.comment,
    });
  }

  // public (hoặc chỉ tutor/admin) xem feedback của 1 tutor
  @Public()
  @Get('tutor/:tutorId')
  async getOfTutor(@Param('tutorId') tutorId: string) {
    return this.feedbacksService.getFeedbacksOfTutor(tutorId);
  }
}
