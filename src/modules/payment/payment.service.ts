import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import MercadoPagoConfig, { Payment } from 'mercadopago';
import { PaymentResponse } from 'mercadopago/dist/clients/payment/commonTypes';

import { Payments } from './schemas/payments.schema';

import { PaymentPix } from '@ds-types/payment-pix.type';

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

  public async payWithCard(
    cardToken: string,
    payerEmail: string,
    amount: number,
    installments = 1,
  ): Promise<PaymentResponse> {
    const paymentData = {
      transaction_amount: amount,
      token: cardToken,
      description: 'Payment test - Dojo System',
      installments,
      payment_method_id: 'visa',
      payer: {
        email: payerEmail,
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
      qrCodeBase64:
        response.point_of_interaction?.transaction_data?.qr_code_base64,
    };
  }
}
