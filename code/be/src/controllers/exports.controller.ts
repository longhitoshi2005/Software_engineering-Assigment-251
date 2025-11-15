import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { ExportsService } from '../services/exports.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';

@Controller('api')
export class ExportsController {
  constructor(private readonly exportsService: ExportsService) {}

  @Post('exports')
  // require auth; RolesGuard will allow any role if not specified
  @UseGuards(JwtAuthGuard, RolesGuard)
  async createExport(@Req() req: any, @Body() body: any) {
    const user = req.user;
    return this.exportsService.createExportJob(body, user);
  }
}
