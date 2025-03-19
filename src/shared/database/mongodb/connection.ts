import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { LoggerService } from '../../services/logger.service';

@Injectable()
export class MongoDbConnectionService {
  constructor(
    @InjectConnection() private readonly connection: Connection,
    private readonly logger: LoggerService,
  ) {
    this.handleConnectionEvents();
  }

  private handleConnectionEvents(): void {
    this.connection.on('connected', () => {
      this.logger.log('MongoDB connected successfully');
    });

    this.connection.on('disconnected', () => {
      this.logger.warn('MongoDB disconnected');
    });

    this.connection.on('error', (error) => {
      this.logger.error(
        `MongoDB connection error: ${error.message}`,
        error.stack,
      );
    });
  }

  getConnection(): Connection {
    return this.connection;
  }
}
