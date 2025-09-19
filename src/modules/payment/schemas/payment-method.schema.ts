import { Prop } from '@nestjs/mongoose';

import { CardType } from '@ds-enums/card-type.enum';

export class PaymentMethod {
  @Prop({
    type: String,
    enum: CardType,
    required: true,
    default: CardType.CREDIT,
  })
  cardType: CardType;

  @Prop({ required: [true, 'A payment method must have a cardholder name'] })
  cardholderName: string;

  @Prop({ required: [true, 'A payment method must have a number'] })
  cardNumber: string;

  @Prop({ required: [true, 'A payment method must have a expiration date'] })
  expirationDate: string;
}
