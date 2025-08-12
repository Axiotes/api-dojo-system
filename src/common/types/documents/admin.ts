import { Document } from 'mongoose';

import { Admin } from '@ds-modules/admin/schemas/admin.schema';

export type AdminDocument = Admin & Document;
