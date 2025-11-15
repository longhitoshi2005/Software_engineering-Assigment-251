// src/controllers/tutors.controller.ts
import { Controller, Get, Param } from '@nestjs/common';
import { TutorsService } from '../services/tutors.service';
import { Roles } from '../common/decorators/roles.decorator';
import { Public } from '../common/decorators/public.decorator';
import { Role } from '../schemas/enums/role.enum';

@Controller('api/tutors')
export class TutorsController {
  constructor(private readonly tutorsService: TutorsService) {}

  // CHỈ admin + coordinator xem toàn bộ tutor
  // public: cho FE load danh sách để hiển thị

  // Public list of tutors (public fields)
  @Public()
  @Get()
  async listPublic() {
    return this.tutorsService.findPublicList();
  }

  // Get tutor schedule and load
  @Get(':id/schedule')
  @Roles(Role.TUTOR, Role.COORDINATOR, Role.ADMIN)
  async getSchedule(@Param('id') id: string) {
    return this.tutorsService.getSchedule(id);
  }

  // (Other write endpoints removed in mock server — read-only public list and schedule provided)
}
