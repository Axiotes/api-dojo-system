import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { JwtPayload } from '@ds-types/jwt-payload.type';

@Injectable()
export class OptionalJwtGuard extends AuthGuard('jwt') {
  handleRequest<TUser extends JwtPayload | null = JwtPayload | null>(
    err: Error | null,
    user: TUser,
  ): TUser {
    if (err || !user) {
      return null as TUser;
    }
    return user;
  }
}
