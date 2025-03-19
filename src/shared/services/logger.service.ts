import {
  Injectable,
  LoggerService as NestLoggerService,
  Scope,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable({ scope: Scope.TRANSIENT })
export class LoggerService implements NestLoggerService {
  private context?: string;

  constructor(private readonly configService: ConfigService) {}

  setContext(context: string): void {
    this.context = context;
  }

  log(message: any, ...optionalParams: any[]): void {
    this.printLog('log', message, ...optionalParams);
  }

  error(message: any, ...optionalParams: any[]): void {
    this.printLog('error', message, ...optionalParams);
  }

  warn(message: any, ...optionalParams: any[]): void {
    this.printLog('warn', message, ...optionalParams);
  }

  debug(message: any, ...optionalParams: any[]): void {
    if (this.configService.get('NODE_ENV') !== 'production') {
      this.printLog('debug', message, ...optionalParams);
    }
  }

  verbose(message: any, ...optionalParams: any[]): void {
    if (this.configService.get('NODE_ENV') !== 'production') {
      this.printLog('verbose', message, ...optionalParams);
    }
  }

  private printLog(
    level: string,
    message: any,
    ...optionalParams: any[]
  ): void {
    const timestamp = new Date().toISOString();
    const contextMessage = this.context ? `[${this.context}] ` : '';

    console[level](
      `${timestamp} ${level.toUpperCase()} ${contextMessage}${message}`,
      ...optionalParams,
    );
  }
}
