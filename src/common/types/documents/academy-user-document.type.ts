import { Document } from 'mongoose';

import { AcademyUser } from '@ds-modules/academy-user/schemas/academy-user.schema';

export type AcademyUserDocument = AcademyUser & Document;
