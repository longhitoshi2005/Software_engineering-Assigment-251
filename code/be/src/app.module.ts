import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';

import { UsersModule, TutorsModule, SessionsModule, TutorSlotsModule, FeedbacksModule, ReportsModule } from './modules';
import { AuthController } from './controllers/auth.controller';
import { AuthService } from './services';
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
    SessionsModule,
    TutorSlotsModule,
    FeedbacksModule,
    ReportsModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
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
