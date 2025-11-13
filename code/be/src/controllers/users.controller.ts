import { Controller, Get, Post } from '@nestjs/common';
import { UsersService } from 'src/services/users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('seed')
  async seed() {
    return this.usersService.createDemoUser();
  }

  @Get()
  async getAll() {
    return this.usersService.findAll();
  }
}
