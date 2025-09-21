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

import { ResponsibleDto } from './responsible.dto';

import { PaymentMode } from '@ds-enums/payment-mode.enum';
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

  @MinLength(8)
  @Matches(/(?=.*[A-Z])/, {
    message: 'password should contain at least 1 uppercase character',
  })
  @Matches(/(?=.*[a-z])/, {
    message: 'password must contain at least one lowercase letter',
  })
  @Matches(/(?=.*\d)/, { message: 'password must contain at least one number' })
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
  @ValidateNested()
  @Type(() => PaymentMethodDto)
  paymentMethod?: PaymentMethodDto;
}
