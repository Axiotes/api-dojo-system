import { Document } from 'mongoose';

import { Athletes } from '@ds-modules/athletes/schemas/athletes.schema';

export type AthleteDocument = Athletes & Document;
