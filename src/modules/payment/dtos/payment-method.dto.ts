import { IsEnum, IsString } from 'class-validator';

import { CardType } from '@ds-enums/card-type.enum';

export class PaymentMethodDto {
  @IsEnum(CardType)
  cardType: CardType;

  @IsString()
  cardHolderName: string;

  @IsString()
  cardNumber: string;

  @IsString()
  expirationMonth: string;

  @IsString()
  expirationYear: string;

  @IsString()
  cvv: string;
}
