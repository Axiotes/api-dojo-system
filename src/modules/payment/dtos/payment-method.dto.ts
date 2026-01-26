import { IsEnum, IsString, Matches } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { i18nValidationMessage } from 'nestjs-i18n';

import { CardType } from '@ds-enums/card-type.enum';

export class PaymentMethodDto {
  @ApiProperty({
    description: 'docs.ATHLETES.DTOS.CARD_TYPE_DESCRIPTION',
    example: 'CREDIT',
  })
  @IsEnum(CardType, { message: i18nValidationMessage('errors.COMMON.IS_ENUM') })
  cardType: CardType;

  @ApiProperty({
    description: 'docs.ATHLETES.DTOS.CARD_TOKEN_DESCRIPTION',
    example: '7890d7363a20a4c03e7ab23014f52c80',
  })
  @IsString({
    message: i18nValidationMessage('errors.COMMON.IS_STRING'),
  })
  cardToken: string;

  @ApiProperty({
    description: 'docs.ATHLETES.DTOS.CARD_HOLDER_NAME_DESCRIPTION',
    example: 'Name',
  })
  @IsString({
    message: i18nValidationMessage('errors.COMMON.IS_STRING'),
  })
  cardHolderName: string;

  @ApiProperty({
    description: 'docs.ATHLETES.DTOS.CARD_NUMBER_DESCRIPTION',
    example: '4242424242424242',
  })
  @IsString({
    message: i18nValidationMessage('errors.COMMON.IS_STRING'),
  })
  @Transform(({ value }) => value.replace(/\s+/g, ''))
  @Matches(/^\d+$/, {
    message: i18nValidationMessage('errors.PAYMENT.CARD_NUMBER_ONLY_NUMBERS'),
  })
  cardNumber: string;

  @ApiProperty({
    description: 'docs.ATHLETES.DTOS.METHOD_ID_DESCRIPTION',
    example: 'visa',
  })
  @IsString({
    message: i18nValidationMessage('errors.COMMON.IS_STRING'),
  })
  methodId: string;

  @ApiProperty({
    description: 'docs.ATHLETES.DTOS.MONTH_EXPIRATION_DESCRIPTION',
    example: '11',
  })
  @IsString({
    message: i18nValidationMessage('errors.COMMON.IS_STRING'),
  })
  expirationMonth: string;

  @ApiProperty({
    description: 'docs.ATHLETES.DTOS.YEAR_EXPIRATION_DESCRIPTION',
    example: '2029',
  })
  @IsString({
    message: i18nValidationMessage('errors.COMMON.IS_STRING'),
  })
  expirationYear: string;
}
