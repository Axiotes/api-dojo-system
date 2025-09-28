import { IsEnum, IsString, Matches } from 'class-validator';
import { Transform } from 'class-transformer';

import { CardType } from '@ds-enums/card-type.enum';

export class PaymentMethodDto {
  @IsEnum(CardType)
  cardType: CardType;

  @IsString()
  cardToken: string;

  @IsString()
  cardHolderName: string;

  @IsString()
  @Transform(({ value }) => value.replace(/\s+/g, ''))
  @Matches(/^\d+$/, { message: 'cardNumber must contain only numbers' })
  cardNumber: string;

  @IsString()
  methodId: string;

  @IsString()
  expirationMonth: string;

  @IsString()
  expirationYear: string;
}
