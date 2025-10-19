import { Types } from 'mongoose';

import { PaymentMode } from '@ds-enums/payment-mode.enum';

export type PayCardData = {
  cardToken: string;
  payerEmail: string;
  athleteId: Types.ObjectId;
  planId: Types.ObjectId;
  amount: number;
  installments?: number;
  cardNumber: string;
  mode: PaymentMode.CARD;
  methodId: string;
};
