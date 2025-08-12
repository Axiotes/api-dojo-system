import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const authUser = request.user;

    if (!authUser) {
      throw new UnauthorizedException('JWT token not found or invalid');
    }

    const requiredRoles = this.reflector.get<string[]>(
      'roles',
      context.getHandler(),
    );

    if (requiredRoles && !requiredRoles.includes(authUser.role)) {
      throw new UnauthorizedException(
        'You do not have permission to access this route',
      );
    }

    return true;
  }
}
