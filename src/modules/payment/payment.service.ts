import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Payments } from './schemas/payments.schema';

@Injectable()
export class PaymentService {
  constructor(
    @InjectModel(Payments.name) private paymentsModel: Model<Payments>,
  ) {}
}
