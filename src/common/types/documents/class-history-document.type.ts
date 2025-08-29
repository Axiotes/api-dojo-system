import { Document } from 'mongoose';

import { ClassesHistory } from '@ds-modules/classes/schemas/classes-history.schema';

export type ClassHistoryDocument = ClassesHistory & Document;
