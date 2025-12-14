import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '@prisma/client';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // If API does not requires specific role -> Pass
    if (!requiredRoles) {
      return true;
    }

    // Get user from request
    const { user } = context.switchToHttp().getRequest();

    // If user has a role that matches the required roles -> True
    if (requiredRoles.some((role) => user.role === role)) {
      return true;
    }

    throw new ForbiddenException('You do not have permission (Admin required)');
  }
}