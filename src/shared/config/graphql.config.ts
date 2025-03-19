import { registerAs } from '@nestjs/config';

export default registerAs('graphql', () => ({
  playground: process.env.NODE_ENV !== 'production',
  introspection: process.env.GRAPHQL_INTROSPECTION === 'true',
  debug: process.env.NODE_ENV !== 'production',
}));
