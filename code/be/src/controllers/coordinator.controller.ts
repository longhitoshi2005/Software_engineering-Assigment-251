import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { MatchingService } from '../services/matching.service';
import { ConflictsService } from '../services/conflicts.service';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../schemas/enums/role.enum';

@Controller('api')
export class CoordinatorController {
  constructor(
    private readonly matchingService: MatchingService,
    private readonly conflictsService: ConflictsService,
  ) {}

  @Get('matching-suggestions')
  @Roles(Role.COORDINATOR)
  async getSuggestions(
    @Query('studentId') studentId: string,
    @Query('limit') limit?: number,
  ) {
    return this.matchingService.getSuggestions(
      studentId,
      limit ? Number(limit) : undefined,
    );
  }

  @Get('coord/student-requests')
  @Roles(Role.COORDINATOR)
  async listStudentRequests(@Query() query: any) {
    // mock: return empty list
    return [];
  }

  @Get('coord/pending-assign')
  @Roles(Role.COORDINATOR)
  async listPendingAssign() {
    return [];
  }

  @Get('conflicts')
  @Roles(Role.COORDINATOR)
  async listConflicts(@Query('department') department?: string) {
    return this.conflictsService.listConflicts(department);
  }

  @Get('coord/sessions')
  @Roles(Role.COORDINATOR)
  async coordSessions(@Query() query: any) {
    // return mock sessions
    return [];
  }

  @Get('coord/tutors')
  @Roles(Role.COORDINATOR)
  async coordTutors(@Query() query: any) {
    // return mock tutors summary
    return [];
  }
}
