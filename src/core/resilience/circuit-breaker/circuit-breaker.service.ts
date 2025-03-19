import { Injectable } from '@nestjs/common';
import { LoggerService } from '../../../shared/services/logger.service';

// Simple circuit breaker states
enum CircuitState {
  CLOSED,
  OPEN,
  HALF_OPEN,
}

@Injectable()
export class CircuitBreakerService {
  private state: CircuitState = CircuitState.CLOSED;
  private failureCount = 0;
  private successCount = 0;
  private lastFailureTime = 0;
  private readonly failureThreshold = 5;
  private readonly resetTimeout = 30000; // 30 seconds
  private readonly halfOpenSuccessThreshold = 2;

  constructor(private readonly logger: LoggerService) {
    this.logger.setContext('CircuitBreakerService');
  }

  async executeWithCircuitBreaker<T>(operation: () => Promise<T>): Promise<T> {
    if (this.isOpen()) {
      this.logger.warn('Circuit is open, rejecting request');
      throw new Error('Service unavailable - circuit breaker is open');
    }

    try {
      const result = await operation();
      this.recordSuccess();
      return result;
    } catch (error) {
      this.recordFailure();
      throw error;
    }
  }

  private isOpen(): boolean {
    if (this.state === CircuitState.OPEN) {
      const now = Date.now();
      if (now - this.lastFailureTime >= this.resetTimeout) {
        this.logger.log('Circuit transitioning to half-open state');
        this.state = CircuitState.HALF_OPEN;
        return false;
      }
      return true;
    }
    return false;
  }

  private recordSuccess(): void {
    if (this.state === CircuitState.HALF_OPEN) {
      this.successCount++;
      if (this.successCount >= this.halfOpenSuccessThreshold) {
        this.logger.log(
          'Circuit closed after successful operations in half-open state',
        );
        this.state = CircuitState.CLOSED;
        this.resetCounters();
      }
    }
  }

  private recordFailure(): void {
    this.lastFailureTime = Date.now();

    if (this.state === CircuitState.HALF_OPEN) {
      this.logger.warn(
        'Failed operation in half-open state, circuit opening again',
      );
      this.state = CircuitState.OPEN;
      this.resetCounters();
      return;
    }

    this.failureCount++;
    if (
      this.state === CircuitState.CLOSED &&
      this.failureCount >= this.failureThreshold
    ) {
      this.logger.warn(
        `Circuit opening after ${this.failureCount} consecutive failures`,
      );
      this.state = CircuitState.OPEN;
      this.resetCounters();
    }
  }

  private resetCounters(): void {
    this.failureCount = 0;
    this.successCount = 0;
  }
}
