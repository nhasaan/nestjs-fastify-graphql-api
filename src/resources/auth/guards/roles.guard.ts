import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { LoggerService } from '../../../shared/services/logger.service';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext('RolesGuard');
  }

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.get<string[]>('roles', context.getHandler());

    if (!roles || roles.length === 0) {
      return true;
    }

    const ctx = GqlExecutionContext.create(context);
    const { user } = ctx.getContext().req;

    if (!user) {
      this.logger.warn('RolesGuard: No user found in request');
      return false;
    }

    // Admin role has access to everything
    if (user.isAdmin && roles.includes('admin')) {
      return true;
    }

    this.logger.warn(
      `User ${user.email} does not have required roles: ${roles.join(', ')}`,
    );
    return false;
  }
}
