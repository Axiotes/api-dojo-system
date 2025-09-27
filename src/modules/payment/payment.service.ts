import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { Payment, MercadoPagoConfig } from 'mercadopago';
import { PaymentResponse } from 'mercadopago/dist/clients/payment/commonTypes';

import { Payments } from './schemas/payments.schema';

import { PaymentPix } from '@ds-types/payment-pix.type';
import { PayCardData } from '@ds-types/pay-card-data.type';

@Injectable()
export class PaymentService {
  private payment: Payment;

  constructor(
    @InjectModel(Payments.name) private paymentsModel: Model<Payments>,
    private readonly configService: ConfigService,
  ) {
    const accessToken = this.configService.get<string>('MP_ACCESS_TOKEN');
    const client = new MercadoPagoConfig({ accessToken });
    this.payment = new Payment(client);
  }

  public async payWithCard(data: PayCardData): Promise<PaymentResponse> {
    const paymentData = {
      transaction_amount: data.amount,
      token: data.cardToken,
      description: 'Payment test - Dojo System',
      installments: data.installments ?? 1,
      payment_method_id: 'visa',
      payer: {
        email: data.payerEmail,
      },
    };

    const response = await this.payment.create({ body: paymentData });

    return response;
  }

  public async payWithPix(
    amount: number,
    payerEmail: string,
  ): Promise<PaymentPix> {
    const paymentData = {
      transaction_amount: amount,
      payment_method_id: 'pix',
      payer: {
        email: payerEmail,
      },
    };

    const response = await this.payment.create({ body: paymentData });

    return {
      paymentId: response.id,
      status: response.status,
      qrCode: response.point_of_interaction?.transaction_data?.qr_code,
      qrCodeBase64: `data:image/png;base64,${response.point_of_interaction?.transaction_data?.qr_code_base64}`,
    };
  }
}
