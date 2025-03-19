import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { MongooseModule } from '@nestjs/mongoose';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { CoreModule } from './core/core.module';
import { UsersModule } from './resources/users/users.module';
import { AuthModule } from './resources/auth/auth.module';
import { ProductsModule } from './resources/products/products.module';
import { SocialFeedModule } from './resources/social-feed/social-feed.module';
import { join } from 'path';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { GlobalExceptionFilter } from './shared/filters';
import { LoggingInterceptor } from './shared/interceptors';
import { JwtAuthGuard } from './resources/auth/guards/jwt-auth.guard';

@Module({
  imports: [
    // Configuration module
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '.env.development'],
    }),

    // GraphQL module
    GraphQLModule.forRootAsync<ApolloDriverConfig>({
      driver: ApolloDriver,
      useFactory: (configService: ConfigService) => ({
        playground: configService.get('NODE_ENV') !== 'production',
        autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
        sortSchema: true,
        debug: configService.get('NODE_ENV') !== 'production',
        introspection: configService.get('GRAPHQL_INTROSPECTION', true),
        context: ({ req }) => ({ req }),
        formatError: (error) => {
          const originalError = error.extensions?.originalError;
          if (!originalError) {
            return {
              message: error.message,
              code: error.extensions?.code || 'INTERNAL_SERVER_ERROR',
            };
          }
          return {
            message: originalError.message || error.message,
            code:
              originalError.code ||
              error.extensions?.code ||
              'INTERNAL_SERVER_ERROR',
            errors: originalError.errors || [],
          };
        },
      }),
      inject: [ConfigService],
    }),

    // MongoDB connection
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }),
      inject: [ConfigService],
    }),

    // Core module
    CoreModule,

    // Feature modules
    AuthModule,
    UsersModule,
    ProductsModule,
    SocialFeedModule,
  ],
  providers: [
    // Global exception filter
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
    // Global interceptor
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
    // Global JWT auth guard - Uncomment to require auth for all endpoints
    /*{
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },*/
  ],
})
export class AppModule {}
