import { Document } from 'mongoose';

import { Classes } from '@ds-modules/classes/schemas/classes.schema';

export type ClassDocument = Classes & Document;
