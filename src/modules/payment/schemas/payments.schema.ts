import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

import { PaymentMode } from '@ds-enums/payment-mode.enum';
import { Athletes } from '@ds-modules/athletes/schemas/athletes.schema';
import { Plans } from '@ds-modules/plans/schemas/plans.schema';

@Schema({ timestamps: true })
export class Payments {
  @Prop({
    required: [true, 'A payment must have an athlete'],
    type: Types.ObjectId,
    ref: Athletes.name,
  })
  athlete: Types.ObjectId;

  @Prop({
    type: String,
    enum: PaymentMode,
    required: [true, 'A payment must have a mode'],
  })
  mode: PaymentMode;

  @Prop({
    required: [true, 'A payment must have a date'],
    type: Date,
  })
  date: Date;

  @Prop({
    required: [true, 'A payment must have a plan'],
    type: Types.ObjectId,
    ref: Plans.name,
  })
  plan: Types.ObjectId;
}

export const PaymentsSchema = SchemaFactory.createForClass(Payments);
