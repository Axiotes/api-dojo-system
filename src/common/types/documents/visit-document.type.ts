import { Document } from 'mongoose';

import { Visits } from '@ds-modules/visits/schemas/visits.schema';

export type VisitDocument = Visits & Document;
