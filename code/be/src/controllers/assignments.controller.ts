import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Param,
  Req,
} from '@nestjs/common';
import { AssignmentsService } from '../services/assignments.service';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../schemas/enums/role.enum';

@Controller('api/assignments')
export class AssignmentsController {
  constructor(private readonly assignmentsService: AssignmentsService) {}

  @Post()
  @Roles(Role.COORDINATOR)
  async create(@Req() req: any, @Body() body: any) {
    const user = req.user || {
      sub: body.coordinatorId,
      role: Role.COORDINATOR,
    };
    return this.assignmentsService.createAssignment(body, user);
  }

  @Get(':id')
  @Roles(Role.COORDINATOR, Role.ADMIN)
  async getById(@Param('id') id: string) {
    return this.assignmentsService.getById(id);
  }
}
