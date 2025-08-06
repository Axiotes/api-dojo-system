import { Document } from 'mongoose';

import { Modalities } from '@ds-modules/modalities/schemas/modalities.schema';

export type ModalitiesDocument = Modalities & Document;
