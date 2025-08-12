import { Reflector } from '@nestjs/core';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';

import { RoleGuard } from './role.guard';

describe('RoleGuard', () => {
  let guard: RoleGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new RoleGuard(reflector);
  });

  const mockExecutionContext = (
    userRole?: string,
    _roles?: string[],
  ): ExecutionContext =>
    ({
      switchToHttp: () => ({
        getRequest: (): { user?: { role?: string } } => ({
          user: userRole ? { role: userRole } : undefined,
        }),
      }),
      getHandler: jest.fn(),
    }) as unknown as ExecutionContext;

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should allow access if user has required role', () => {
    const context = mockExecutionContext('admin', ['admin']);
    jest.spyOn(reflector, 'get').mockReturnValue(['admin']);

    expect(guard.canActivate(context)).toBe(true);
  });

  it('should allow access if no roles are required', () => {
    const context = mockExecutionContext('user');
    jest.spyOn(reflector, 'get').mockReturnValue(undefined);

    expect(guard.canActivate(context)).toBe(true);
  });

  it('should throw UnauthorizedException if user is not authenticated', () => {
    const context = mockExecutionContext(undefined);
    jest.spyOn(reflector, 'get').mockReturnValue(['admin']);

    expect(() => guard.canActivate(context)).toThrow(
      new UnauthorizedException('JWT token not found or invalid'),
    );
  });

  it('should throw UnauthorizedException if user role is not allowed', () => {
    const context = mockExecutionContext('user', ['admin']);
    jest.spyOn(reflector, 'get').mockReturnValue(['admin']);

    expect(() => guard.canActivate(context)).toThrow(
      new UnauthorizedException(
        'You do not have permission to access this route',
      ),
    );
  });
});
