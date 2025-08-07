import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { PaymentsSchema } from './schemas/payments.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Payments', schema: PaymentsSchema }]),
  ],
})
export class PaymentModule {}
