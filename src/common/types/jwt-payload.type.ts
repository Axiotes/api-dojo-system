import { AuthRole } from '@ds-enums/auth-role.enum';

export type JwtPayload = { id: string; role: AuthRole };
