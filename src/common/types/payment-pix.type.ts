import { Payments } from '@ds-modules/payment/schemas/payments.schema';

export type PaymentPix = Payments & {
  qrCode: string;
  qrCodeBase64: string;
};
