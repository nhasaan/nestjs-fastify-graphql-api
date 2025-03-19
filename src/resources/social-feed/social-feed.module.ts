import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SocialFeedService } from './social-feed.service';
import { SocialFeedResolver } from './social-feed.resolver';
import { Post, PostSchema } from './entities/post.entity';
import { LoggerService } from '../../shared/services/logger.service';
import { CircuitBreakerService } from '../../core/resilience/circuit-breaker/circuit-breaker.service';
import { UsersModule } from '@resources/users/users.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Post.name, schema: PostSchema }]),
    UsersModule,
    ConfigModule,
  ],
  providers: [
    SocialFeedResolver,
    SocialFeedService,
    LoggerService,
    CircuitBreakerService,
  ],
  exports: [SocialFeedService],
})
export class SocialFeedModule {}
