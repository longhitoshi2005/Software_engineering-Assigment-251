import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { AdminService } from '../services/admin.service';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../schemas/enums/role.enum';

@Controller('api')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post('tutors')
  @Roles(Role.ADMIN)
  async createTutors(@Body() body: any) {
    return this.adminService.createTutors(body.tutors || []);
  }

  @Get('audit-logs')
  @Roles(Role.ADMIN)
  async getAuditLogs(
    @Query('since') since?: string,
    @Query('actorId') actorId?: string,
  ) {
    return this.adminService.getAuditLogs(since, actorId);
  }
}
