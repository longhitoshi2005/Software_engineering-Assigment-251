import { Body, Controller, Get, Param, Post, Delete } from '@nestjs/common';
import { TutorSlotsService } from '../services/tutor-slots.service';
import { Roles } from '../common/decorators/roles.decorator';
import { Public } from '../common/decorators/public.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Role } from '../schemas';
import { TutorsService } from '../services/tutors.service';
import { CreateTutorSlotDto } from 'src/common/dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('tutor-slots')
@ApiBearerAuth('access-token')
@Controller('tutor-slots')
export class TutorSlotsController {
  constructor(
    private readonly tutorSlotsService: TutorSlotsService,
    private readonly tutorsService: TutorsService,
  ) {}

  // Tutor tạo slot rảnh
  @Roles(Role.TUTOR)
  @Post()
  async create(
    @CurrentUser('sub') tutorUserId: string,
    @Body() dto: CreateTutorSlotDto,
  ) {
    // tìm đúng tutor doc theo userId
    const tutor = await this.tutorsService.findByUserId(tutorUserId);

    // chuyển string ISO → Date
    const start = new Date(dto.startTime);
    const end = new Date(dto.endTime);

    return this.tutorSlotsService.createSlot(tutor._id.toString(), {
      startTime: start,
      endTime: end,
      subject: dto.subject,
    });
  }

  @Roles(Role.TUTOR)
  @Get('me')
  async mySlots(@CurrentUser('sub') tutorUserId: string) {
    const tutor = await this.tutorsService.findByUserId(tutorUserId);
    return this.tutorSlotsService.findByTutor(tutor._id.toString());
  }

  @Public()
  @Get('available/:tutorId')
  async getAvailable(@Param('tutorId') tutorId: string) {
    return this.tutorSlotsService.findAvailableSlots(tutorId);
  }

  @Roles(Role.TUTOR, Role.ADMIN)
  @Delete(':slotId')
  async cancel(@Param('slotId') slotId: string, @CurrentUser('role') role: string) {
    return this.tutorSlotsService.cancelSlot(slotId, role);
  }
}
