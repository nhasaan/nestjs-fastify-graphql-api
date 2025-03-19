import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersService } from './users.service';
import { UsersResolver } from './users.resolver';
import { User, UserSchema } from './entities/user.entity';
import { LoggerService } from '../../shared/services/logger.service';
import { CircuitBreakerService } from '../../core/resilience/circuit-breaker/circuit-breaker.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    ConfigModule,
  ],
  providers: [
    UsersResolver,
    UsersService,
    LoggerService,
    CircuitBreakerService,
  ],
  exports: [UsersService],
})
export class UsersModule {}
