import { Transform } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsEmail,
  IsMongoId,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Min,
} from 'class-validator';
import { Types } from 'mongoose';
import { i18nValidationMessage } from 'nestjs-i18n';

export class UpdateTeacherDto {
  @IsOptional()
  @IsString({
    message: i18nValidationMessage('errors.COMMON.IS_STRING'),
  })
  name?: string;

  @IsOptional()
  @IsString({
    message: i18nValidationMessage('errors.COMMON.IS_STRING'),
  })
  @Length(11, 11, {
    message: i18nValidationMessage('errors.COMMON.CPF_LENGTH'),
  })
  cpf?: string;

  @IsOptional()
  @IsEmail({}, { message: i18nValidationMessage('errors.COMMON.IS_EMAIL') })
  email?: string;

  @IsOptional()
  @IsString({
    message: i18nValidationMessage('errors.COMMON.IS_STRING'),
  })
  @IsString({
    message: i18nValidationMessage('errors.COMMON.IS_STRING'),
  })
  description?: string;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber({}, { message: i18nValidationMessage('errors.COMMON.IS_NUMBER') })
  @Min(1, {
    message: i18nValidationMessage('errors.COMMON.MIN_NUMBER', { min: 1 }),
  })
  hourPrice?: number;

  @IsOptional()
  @IsArray({ message: i18nValidationMessage('errors.COMMON.IS_ARRAY') })
  @ArrayNotEmpty({
    message: i18nValidationMessage('errors.COMMON.ARRAY_NOT_EMPTY'),
  })
  @IsMongoId({
    each: true,
    message: i18nValidationMessage('errors.COMMON.INVALID_ID'),
  })
  modalities?: Types.ObjectId[];
}
