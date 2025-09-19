import { IsEnum, IsString } from 'class-validator';

import { CardType } from '@ds-enums/card-type.enum';

export class PaymentMethodDto {
  @IsEnum(CardType)
  cardType: CardType;

  @IsString()
  cardholderName: string;

  @IsString()
  cardNumber: string;

  @IsString()
  expirationDate: string;

  @IsString()
  cvv: string;
}
