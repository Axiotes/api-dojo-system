import { Document } from 'mongoose';

import { Payments } from '@ds-modules/payment/schemas/payments.schema';

export type PaymentDocument = Payments & Document;
