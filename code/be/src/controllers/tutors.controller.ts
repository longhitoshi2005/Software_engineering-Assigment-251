// src/controllers/tutors.controller.ts
import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { TutorsService } from '../services/tutors.service';
import { Roles } from '../common/decorators/roles.decorator';
import { Public } from '../common/decorators/public.decorator';
import { Role } from '../schemas';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('tutors')
export class TutorsController {
  constructor(private readonly tutorsService: TutorsService) {}

  // CHỈ admin + coordinator xem toàn bộ tutor
  @Get()
  @Roles(Role.ADMIN, Role.COORDINATOR)
  async getAll() {
    return this.tutorsService.findAll();
  }

  // public: cho FE load danh sách để hiển thị
  @Public()
  @Get('public')
  async getPublic() {
    return this.tutorsService.findAll();
  }

  // tạo tutor profile cho 1 user cụ thể
  // admin / coordinator mới được tạo hộ người khác
  @Post('user/:userId')
  @Roles(Role.ADMIN, Role.COORDINATOR)
  async createForUser(
    @Param('userId') userId: string,
    @Body() body: any,
  ) {
    return this.tutorsService.createForUser(userId, {
      subjects: body.subjects,
      courseCodes: body.courseCodes,
      bio: body.bio,
    });
  }

  // chính tutor đó tự update profile của mình
  // (nếu bạn muốn cho tutor tự sửa)
  @Patch('me')
  @Roles(Role.TUTOR)
  async updateMyTutor(
    @CurrentUser('sub') userId: string,
    @Body() body: any,
  ) {
    return this.tutorsService.updateByUserId(userId, body);
  }

  // admin / coordinator update tutor bất kỳ
  @Patch('user/:userId')
  @Roles(Role.ADMIN, Role.COORDINATOR)
  async updateForUser(
    @Param('userId') userId: string,
    @Body() body: any,
  ) {
    return this.tutorsService.updateByUserId(userId, body);
  }
}
