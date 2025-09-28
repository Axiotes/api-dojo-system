import { Types } from 'mongoose';

import { PaymentMode } from '@ds-enums/payment-mode.enum';

export type PayPixData = {
  payerEmail: string;
  athleteId: Types.ObjectId;
  planId: Types.ObjectId;
  amount: number;
  mode: PaymentMode;
};
