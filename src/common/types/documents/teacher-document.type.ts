import { Document } from 'mongoose';

import { Teachers } from '@ds-modules/teachers/schemas/teachers.schema';

export type TeacherDocument = Teachers & Document;
