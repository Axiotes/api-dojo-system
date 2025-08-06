import { Document } from 'mongoose';

import { Plans } from '@ds-modules/plans/schemas/plans.schema';

export type PlanDocument = Plans & Document;
