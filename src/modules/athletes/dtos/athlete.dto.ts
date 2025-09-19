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
  ValidateNested,
} from 'class-validator';
import { Types } from 'mongoose';

import { ResponsibleDto } from './responsible.dto';

import { PaymentMode } from '@ds-enums/payment-mode.enum';

export class AthleteDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsString()
  @Length(11, 11)
  cpf: string;

  @Type(() => Date)
  @IsDate({ message: 'Date of birth must be in YYYY-MM-DD format' })
  birthDate: Date;

  @IsMongoId()
  plan: Types.ObjectId;

  @IsMongoId()
  classes: Types.ObjectId;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  password?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => ResponsibleDto)
  responsible?: ResponsibleDto;

  @IsEnum(PaymentMode)
  paymentMode: PaymentMode;

  @IsOptional()
  @IsString()
  cardToken?: string;
}
