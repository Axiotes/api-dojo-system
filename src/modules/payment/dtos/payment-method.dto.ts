import { IsEnum, IsString, Matches } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { i18nValidationMessage } from 'nestjs-i18n';

import { CardType } from '@ds-enums/card-type.enum';

export class PaymentMethodDto {
  @ApiProperty({
    description: 'Tipo do cartão (Débito ou Crédito)',
    example: 'CREDIT',
  })
  @IsEnum(CardType, { message: i18nValidationMessage('errors.COMMON.IS_ENUM') })
  cardType: CardType;

  @ApiProperty({
    description: 'Token do cartão gerado pelo Mercado Pago',
    example: '7890d7363a20a4c03e7ab23014f52c80',
  })
  @IsString({
    message: i18nValidationMessage('errors.COMMON.IS_STRING'),
  })
  cardToken: string;

  @ApiProperty({
    description: 'Nome do titular do cartão',
    example: 'Nome Titular',
  })
  @IsString({
    message: i18nValidationMessage('errors.COMMON.IS_STRING'),
  })
  cardHolderName: string;

  @ApiProperty({ description: 'Número do cartão', example: '4242424242424242' })
  @IsString({
    message: i18nValidationMessage('errors.COMMON.IS_STRING'),
  })
  @Transform(({ value }) => value.replace(/\s+/g, ''))
  @Matches(/^\d+$/, {
    message: i18nValidationMessage('errors.PAYMENT.CARD_NUMBER_ONLY_NUMBERS'),
  })
  cardNumber: string;

  @ApiProperty({
    description: 'ID do método do cartão (visa, master...)',
    example: 'visa',
  })
  @IsString({
    message: i18nValidationMessage('errors.COMMON.IS_STRING'),
  })
  methodId: string;

  @ApiProperty({ description: 'Mês de expiração do cartão', example: '11' })
  @IsString({
    message: i18nValidationMessage('errors.COMMON.IS_STRING'),
  })
  expirationMonth: string;

  @ApiProperty({ description: 'Ano de expiração do cartão', example: '2029' })
  @IsString({
    message: i18nValidationMessage('errors.COMMON.IS_STRING'),
  })
  expirationYear: string;
}
