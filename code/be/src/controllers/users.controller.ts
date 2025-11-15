import { Controller, Get, Post, Param, Body } from '@nestjs/common';
import { UsersService } from 'src/services/users.service';
import { Public } from '../common/decorators/public.decorator';

@Controller('api/students')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('seed')
  async seed() {
    return this.usersService.createDemoUser();
  }

  @Public()
  @Get(':id')
  async getById(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  @Get()
  async getAll() {
    return this.usersService.findAll();
  }

  @Public()
  @Post('requests')
  async createRequest(@Body() body: any) {
    // In a real implementation we'd persist; here return a mock request id
    return { requestId: `req-${Date.now()}` };
  }
}
