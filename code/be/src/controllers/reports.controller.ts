import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { ReportsService } from '../services/reports.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { Role, ReportStatus, ReportTargetType } from '../schemas';
import { CreateReportDto } from 'src/common/dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('reports')
@ApiBearerAuth('access-token')
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  // student / tutor / bất kỳ user: gửi report
  @Post()
  async create(
    @CurrentUser('sub') userId: string,
    @Body() dto: CreateReportDto,
  ) {
    return this.reportsService.createReport(userId, {
      targetType: dto.targetType,
      targetId: dto.targetId,
      reason: dto.reason,
      description: dto.description,
    });
  }

  // admin / coordinator xem tất cả
  @Roles(Role.ADMIN, Role.COORDINATOR)
  @Get()
  async findAll() {
    return this.reportsService.findAll();
  }

  // admin / coordinator cập nhật trạng thái
  @Roles(Role.ADMIN, Role.COORDINATOR)
  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @CurrentUser('sub') handlerId: string,
    @Body('status') status: ReportStatus,
  ) {
    return this.reportsService.updateStatus(id, handlerId, status);
  }
}
