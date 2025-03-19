import { registerAs } from '@nestjs/config';

export default registerAs('database', () => ({
  mongodb: {
    uri:
      process.env.MONGODB_URI ||
      'mongodb://localhost:27017/nest-fastify-graphql',
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    },
  },
  redis: {
    enabled: process.env.REDIS_ENABLED === 'true',
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT, 10) || 6379,
    password: process.env.REDIS_PASSWORD || '',
    db: parseInt(process.env.REDIS_DB, 10) || 0,
  },
}));
