import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { SessionsService } from '../services/sessions.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { Role, SessionStatus } from '../schemas';
import { CreateSessionDto } from 'src/common/dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('sessions')
@ApiBearerAuth('access-token')
@Controller('sessions')
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  // student đặt lịch
  @Roles(Role.STUDENT)
  @Post()
  async createFromSlot(
    @CurrentUser('sub') studentId: string,
    @Body() dto: CreateSessionDto,
  ) {
    return this.sessionsService.bookSlot(studentId, dto.slotId, dto.note);
  }

  // student xem lịch của mình
  @Roles(Role.STUDENT)
  @Get('my')
  async getMySessions(@CurrentUser('sub') studentId: string) {
    return this.sessionsService.findByStudent(studentId);
  }

  // tutor xem lịch dạy của mình
  @Roles(Role.TUTOR)
  @Get('tutor')
  async getTutorSessions(@CurrentUser('sub') tutorId: string) {
    return this.sessionsService.findByTutor(tutorId);
  }

  // admin / coordinator đổi trạng thái
  @Roles(Role.ADMIN, Role.COORDINATOR)
  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: SessionStatus,
  ) {
    return this.sessionsService.updateStatus(id, status);
  }
}
