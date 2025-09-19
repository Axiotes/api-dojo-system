import { Type } from 'class-transformer';
import {
  IsDate,
  IsEmail,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  ValidateNested,
} from 'class-validator';
import { Types } from 'mongoose';

import { ResponsibleDto } from './responsible.dto';

import { PaymentMethodDto } from '@ds-modules/payment/dtos/payment-method.dto';

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

  @ValidateNested()
  @Type(() => ResponsibleDto)
  responsible?: ResponsibleDto;

  @ValidateNested()
  @Type(() => PaymentMethodDto)
  paymentMethod: PaymentMethodDto;
}
