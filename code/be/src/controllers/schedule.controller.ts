import { Controller } from '@nestjs/common';
import { ScheduleService } from 'src/services/';

@Controller('schedule')
export class ScheduleController {
  constructor(private readonly scheduleService: ScheduleService) {}
}