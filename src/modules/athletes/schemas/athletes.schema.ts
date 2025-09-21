import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

import { PaymentMethod } from '../../payment/schemas/payment-method.schema';

import { Responsible } from './responsible.schema';

import { Plans } from '@ds-modules/plans/schemas/plans.schema';

@Schema({ timestamps: true })
export class Athletes {
  @Prop({ required: [true, 'An athlete must have a name'], type: String })
  name: string;

  @Prop({
    required: [true, 'An athlete must have a cpf'],
    type: String,
    unique: true,
    length: 11,
  })
  cpf: string;

  @Prop({
    required: false,
    type: String,
    unique: true,
    match: [/.+\@.+\..+/, 'Please enter a valid email address'],
  })
  email?: string;

  @Prop({ required: [true, 'An athlete must have a birth date'], type: Date })
  birthDate: Date;

  @Prop({ required: false, type: String })
  graduation: string;

  @Prop({ required: false, type: String })
  password: string;

  @Prop({ type: [Responsible], required: false })
  responsibles?: Responsible[];

  @Prop({
    type: Types.ObjectId,
    ref: Plans.name,
    required: [true, 'A athlete must have a plan'],
  })
  plan: Types.ObjectId;

  @Prop({ type: [PaymentMethod], required: false })
  paymentMethod?: PaymentMethod[];

  @Prop({
    required: [true, 'An athlete must have a status'],
    type: Boolean,
    default: true,
  })
  status: boolean;
}

export const AthletesSchema = SchemaFactory.createForClass(Athletes);
