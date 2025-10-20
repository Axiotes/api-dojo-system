import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { PaymentsSchema } from './schemas/payments.schema';
import { PaymentService } from './payment.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Payments', schema: PaymentsSchema }]),
  ],
  providers: [PaymentService],
  exports: [PaymentService],
})
export class PaymentModule {}
