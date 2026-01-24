import { IsEnum, IsMongoId, IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { Types } from 'mongoose';
import { i18nValidationMessage } from 'nestjs-i18n';

import { Period } from '@ds-enums/period.enum';

export class PlanDto {
  @ApiProperty({
    description: 'Unidade do período do plano, enum: ("monthly", "annually")',
    example: 'monthly',
  })
  @IsEnum(['monthly', 'annually'], {
    message: i18nValidationMessage('errors.COMMON.IS_ENUM'),
  })
  period: Period;

  @ApiProperty({
    description: 'Quantidade do período definido em period',
    example: '3',
  })
  @Transform(({ value }) => parseInt(value))
  @IsNumber({}, { message: i18nValidationMessage('errors.COMMON.IS_NUMBER') })
  @Min(1, {
    message: i18nValidationMessage('errors.COMMON.MIN_NUMBER', { min: 1 }),
  })
  periodQuantity: number;

  @ApiProperty({
    description: 'Preço do plano',
    example: '150.00',
  })
  @Transform(({ value }) => parseInt(value))
  @IsNumber({}, { message: i18nValidationMessage('errors.COMMON.IS_NUMBER') })
  @Min(1, {
    message: i18nValidationMessage('errors.COMMON.MIN_NUMBER', { min: 1 }),
  })
  value: number;

  @ApiProperty({
    description: 'Referência para a modalidade à qual o plano pertence',
    example: '64f1b2a3c4d5e6f7890abc12',
  })
  @IsMongoId({ message: i18nValidationMessage('errors.COMMON.INVALID_ID') })
  modality: Types.ObjectId;
}
