import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';

import { UsersModule, TutorsModule } from './modules';
import { AuthController } from './controllers/auth.controller';
import { AiController } from './controllers/ai.controller';
import { CoordinatorController } from './controllers/coordinator.controller';
import { AssignmentsController } from './controllers/assignments.controller';
import { ExportsController } from './controllers/exports.controller';
import { AdminController } from './controllers/admin.controller';
import { AuthService } from './services';
import {
  MatchingService,
  AssignmentsService,
  ConflictsService,
  ExportsService,
  AdminService,
} from './services';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot(process.env.MONGODB_URI),
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET || 'dev-secret',
      signOptions: { expiresIn: '1h' },
    }),
    UsersModule,
    TutorsModule,
  ],
  controllers: [
    AuthController,
    AiController,
    CoordinatorController,
    AssignmentsController,
    ExportsController,
    AdminController,
  ],
  providers: [
    AuthService,
    MatchingService,
    AssignmentsService,
    ConflictsService,
    ExportsService,
    AdminService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
