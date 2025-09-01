import { OptionalJwtGuard } from './optional-jwt.guard';

import { JwtPayload } from '@ds-types/jwt-payload.type';
import { AuthRole } from '@ds-enums/auth-role.enum';

describe('OptionalJwtGuard', () => {
  let guard: OptionalJwtGuard;

  beforeEach(() => {
    guard = new OptionalJwtGuard();
  });

  it('should return the user when token present with role admin', () => {
    const user: JwtPayload = { id: 'u-admin', role: AuthRole.ADMIN };
    const result = guard.handleRequest<JwtPayload | null>(null, user);

    expect(result).toBe(user);
    expect(result?.role).toBe(AuthRole.ADMIN);
  });

  it('should return the user when token present with role different from admin', () => {
    const user: JwtPayload = { id: 'u-user', role: AuthRole.ATHLETE };
    const result = guard.handleRequest<JwtPayload | null>(null, user);

    expect(result).toBe(user);
    expect(result?.role).toBe(AuthRole.ATHLETE);
  });

  it('should return null when no token is provided', () => {
    const result = guard.handleRequest<JwtPayload | null>(null, null);

    expect(result).toBeNull();
  });
});
