import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { Model, Types } from 'mongoose';
import { Payment } from 'mercadopago';

import { PaymentService } from './payment.service';
import { Payments } from './schemas/payments.schema';

import { PaymentDocument } from '@ds-types/documents/payment-document.type';
import { PayCardData } from '@ds-types/pay-card-data.type';
import { PaymentMode } from '@ds-enums/payment-mode.enum';
import { PayPixData } from '@ds-types/pay-pix-data.type';

describe('PaymentService', () => {
  let service: PaymentService;
  let paymentsModel: Model<PaymentDocument>;
  let paymentMock: jest.Mocked<Payment>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentService,
        {
          provide: getModelToken(Payments.name),
          useValue: {
            create: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('FAKE_ACCESS_TOKEN'),
          },
        },
      ],
    }).compile();

    service = module.get<PaymentService>(PaymentService);
    paymentsModel = module.get(getModelToken(Payments.name));

    paymentMock = {
      create: jest.fn(),
    } as unknown as jest.Mocked<Payment>;

    Object.defineProperty(service, 'payment', {
      value: paymentMock,
    });
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a payment with card successfully', async () => {
    const payCardData: PayCardData = {
      amount: 100,
      cardToken: 'fake-token',
      installments: 1,
      methodId: 'visa',
      payerEmail: 'test@example.com',
      athleteId: new Types.ObjectId(),
      mode: PaymentMode.CARD,
      planId: new Types.ObjectId(),
      cardNumber: '4242424242424242',
    };

    const mpResponse = {
      id: 'mp_001',
      status: 'approved',
      payment_method_id: 'visa',
    };

    const savedPayment = {
      _id: new Types.ObjectId(),
      athlete: payCardData.athleteId,
      plan: payCardData.planId,
      status: mpResponse.status,
      methodId: mpResponse.payment_method_id,
      paymentIdMP: mpResponse.id,
      date: new Date().toLocaleString('pt-BR', {
        timeZone: 'America/Sao_Paulo',
      }),
      mode: PaymentMode.CARD,
    } as PaymentDocument;

    paymentMock.create = jest.fn().mockResolvedValue(mpResponse);
    paymentsModel.create = jest.fn().mockResolvedValue(savedPayment);

    const result = await service.payWithCard(payCardData);

    expect(result).toEqual(savedPayment);
  });

  it('should create a payment with pix successfully', async () => {
    const payCardData: PayPixData = {
      amount: 100,
      payerEmail: 'test@example.com',
      athleteId: new Types.ObjectId(),
      mode: PaymentMode.PIX,
      planId: new Types.ObjectId(),
    };

    const mpResponse = {
      id: 'mp_001',
      status: 'approved',
      payment_method_id: 'visa',
      point_of_interaction: {
        transaction_data: {
          qr_code: 'fake_qr_code',
          qr_code_base64: `fake_qr_code_base64`,
        },
      },
    };

    const savedPayment = {
      _id: new Types.ObjectId(),
      athlete: payCardData.athleteId,
      plan: payCardData.planId,
      status: mpResponse.status,
      methodId: mpResponse.payment_method_id,
      paymentIdMP: mpResponse.id,
      date: new Date().toLocaleString('pt-BR', {
        timeZone: 'America/Sao_Paulo',
      }),
      mode: PaymentMode.PIX,
      toObject: () => {},
    } as PaymentDocument;

    const objReturn = {
      ...savedPayment.toObject(),
      qrCode: mpResponse.point_of_interaction?.transaction_data?.qr_code,
      qrCodeBase64: `data:image/png;base64,${mpResponse.point_of_interaction?.transaction_data?.qr_code_base64}`,
    };

    paymentMock.create = jest.fn().mockResolvedValue(mpResponse);
    paymentsModel.create = jest.fn().mockResolvedValue(savedPayment);

    const result = await service.payWithPix(payCardData);

    expect(result).toEqual(objReturn);
  });
});
