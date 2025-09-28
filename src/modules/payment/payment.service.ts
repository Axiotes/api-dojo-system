import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { Payment, MercadoPagoConfig } from 'mercadopago';

import { Payments } from './schemas/payments.schema';

import { PaymentPix } from '@ds-types/payment-pix.type';
import { PayCardData } from '@ds-types/pay-card-data.type';
import { PaymentDocument } from '@ds-types/documents/payment-document.type';
import { PayPixData } from '@ds-types/pay-pix-data.type';

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

  public async payWithCard(data: PayCardData): Promise<PaymentDocument> {
    const paymentData = {
      transaction_amount: data.amount,
      token: data.cardToken,
      installments: data.installments ?? 1,
      payment_method_id: data.methodId,
      payer: {
        email: data.payerEmail,
      },
    };

    const response = await this.payment.create({ body: paymentData });

    const payment = await this.paymentsModel.create({
      athlete: data.athleteId,
      mode: data.mode,
      methodId: response.payment_method_id,
      paymentIdMP: response.id,
      status: response.status,
      date: new Date().toLocaleString('pt-BR', {
        timeZone: 'America/Sao_Paulo',
      }),
      plan: data.planId,
    });

    return payment;
  }

  public async payWithPix(data: PayPixData): Promise<PaymentPix> {
    const paymentData = {
      transaction_amount: data.amount,
      payment_method_id: 'pix',
      payer: {
        email: data.payerEmail,
      },
    };

    const response = await this.payment.create({ body: paymentData });

    const payment = await this.paymentsModel.create({
      athlete: data.athleteId,
      mode: data.mode,
      methodId: response.payment_method_id,
      paymentIdMP: response.id,
      status: response.status,
      date: new Date().toLocaleString('pt-BR', {
        timeZone: 'America/Sao_Paulo',
      }),
      plan: data.planId,
    });

    return {
      ...payment,
      qrCode: response.point_of_interaction?.transaction_data?.qr_code,
      qrCodeBase64: `data:image/png;base64,${response.point_of_interaction?.transaction_data?.qr_code_base64}`,
    };
  }
}
