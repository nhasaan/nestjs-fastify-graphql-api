import { Module, Global } from '@nestjs/common';
import { LoggerService } from './services/logger.service';
import { DateScalar } from './graphql/scalars/date.scalar';
import { ObjectIdScalar } from './graphql/scalars/object-id.scalar';
import { MongoDbConnectionService } from './database/mongodb/connection';

@Global()
@Module({
  providers: [
    LoggerService,
    DateScalar,
    ObjectIdScalar,
    MongoDbConnectionService,
  ],
  exports: [
    LoggerService,
    DateScalar,
    ObjectIdScalar,
    MongoDbConnectionService,
  ],
})
export class SharedModule {}
