import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { GqlArgumentsHost } from '@nestjs/graphql';
import { FastifyReply } from 'fastify';
import { LoggerService } from '../services/logger.service';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: LoggerService) {
    this.logger.setContext('GlobalExceptionFilter');
  }

  catch(exception: any, host: ArgumentsHost) {
    const gqlHost = GqlArgumentsHost.create(host);
    const isGql = host.getType() === 'graphql';

    if (isGql) {
      // Let GraphQL handle the error formatting
      this.logError(exception);
      return exception;
    }

    const ctx = host.switchToHttp();
    const response = ctx.getResponse<FastifyReply>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.message
        : 'Internal server error';

    const error =
      exception instanceof HttpException
        ? exception.getResponse()
        : { message, status };

    this.logError(exception);

    response.status(status).send({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: ctx.getRequest().url,
      error,
    });
  }

  private logError(exception: any): void {
    const message = exception.message;
    const stack = exception.stack;

    this.logger.error(`Error: ${message}`, stack);
  }
}
