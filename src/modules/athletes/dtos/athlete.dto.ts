import { Type } from 'class-transformer';
import {
  IsDate,
  IsEmail,
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  Matches,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { Types } from 'mongoose';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { i18nValidationMessage } from 'nestjs-i18n';

import { ResponsibleDto } from './responsible.dto';

import { PaymentMode } from '@ds-enums/payment-mode.enum';
import { PaymentMethodDto } from '@ds-modules/payment/dtos/payment-method.dto';

export class AthleteDto {
  @ApiProperty({
    description: 'docs.ATHLETES.DTOS.NAME_DESCRIPTION',
    example: 'Nome Completo',
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    description: 'docs.ATHLETES.DTOS.CPF_DESCRIPTION',
    example: '12345678910',
  })
  @IsString()
  @Length(11, 11)
  cpf: string;

  @ApiProperty({
    description: 'docs.ATHLETES.DTOS.BIRTH_DATE_DESCRIPTION',
    example: '2022-04-06',
  })
  @Type(() => Date)
  @IsDate({ message: i18nValidationMessage('errors.ATHLETES.DATE_FORMAT') })
  dateBirth: Date;

  @ApiProperty({
    description: 'docs.ATHLETES.DTOS.PLAN_ID_DESCRIPTION',
    example: '64f1b2a3c4d5e6f7890abc12',
  })
  @IsMongoId()
  plan: Types.ObjectId;

  @ApiProperty({
    description: 'docs.ATHLETES.DTOS.CLASS_ID_DESCRIPTION',
    example: '64f1b2a3c4d5e6f7890abc34',
  })
  @IsMongoId()
  classes: Types.ObjectId;

  @ApiPropertyOptional({
    description: 'docs.ATHLETES.DTOS.EMAIL_DESCRIPTION',
    example: 'athlete@gmail.com',
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({
    description: 'docs.ATHLETES.DTOS.PASSWORD_DESCRIPTION',
    example: 'StrongPassword123',
  })
  @MinLength(8)
  @Matches(/(?=.*[A-Z])/, {
    message: i18nValidationMessage('errors.ATHLETES.PASSWORD_UPPERCASE'),
  })
  @Matches(/(?=.*[a-z])/, {
    message: i18nValidationMessage('errors.ATHLETES.PASSWORD_LOWERCASE'),
  })
  @Matches(/(?=.*\d)/, {
    message: i18nValidationMessage('errors.ATHLETES.PASSWORD_NUMBER'),
  })
  @IsOptional()
  @IsString()
  password?: string;

  @ApiPropertyOptional({
    description: 'docs.ATHLETES.DTOS.RESPONSIBLE_DESCRIPTION',
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => ResponsibleDto)
  responsible?: ResponsibleDto;

  @ApiProperty({
    description: 'docs.ATHLETES.DTOS.PAYMENT_MODE_DESCRIPTION',
    example: 'CARD',
  })
  @IsEnum(PaymentMode)
  paymentMode: PaymentMode;

  @ApiPropertyOptional({
    description: 'docs.ATHLETES.DTOS.PAYMENT_METHOD_DESCRIPTION',
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => PaymentMethodDto)
  paymentMethod?: PaymentMethodDto;
}
