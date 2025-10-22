import {
  ArrayNotEmpty,
  IsArray,
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  Min,
  Validate,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { Types } from 'mongoose';
import { i18nValidationMessage } from 'nestjs-i18n';

import { AgeConstraint } from '@ds-common/validators/age.validator';
import { HourConstraint } from '@ds-common/validators/hour.validator';
import { WeekDays } from '@ds-enums/week-days.enum';

export class ClassDto {
  @IsMongoId({ message: i18nValidationMessage('errors.COMMON.INVALID_ID') })
  modality: Types.ObjectId;

  @IsMongoId({ message: i18nValidationMessage('errors.COMMON.INVALID_ID') })
  teacher: Types.ObjectId;

  @IsNotEmpty({
    message: i18nValidationMessage('errors.COMMON.IS_STRING'),
  })
  @IsString({
    message: i18nValidationMessage('errors.COMMON.IS_STRING'),
  })
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: i18nValidationMessage('errors.COMMON.MATCH_HOUR'),
  })
  startHour: string;

  @IsNotEmpty({
    message: i18nValidationMessage('errors.COMMON.IS_STRING'),
  })
  @IsString({
    message: i18nValidationMessage('errors.COMMON.IS_STRING'),
  })
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: i18nValidationMessage('errors.COMMON.MATCH_HOUR'),
  })
  @Validate(HourConstraint)
  endHour: string;

  @Transform(({ value }) => parseInt(value))
  @IsNumber({}, { message: i18nValidationMessage('errors.COMMON.IS_NUMBER') })
  @Min(0, {
    message: i18nValidationMessage('errors.COMMON.MIN_NUMBER', { min: 0 }),
  })
  minAge: number;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber({}, { message: i18nValidationMessage('errors.COMMON.IS_NUMBER') })
  @Min(0, {
    message: i18nValidationMessage('errors.COMMON.MIN_NUMBER', { min: 0 }),
  })
  @Validate(AgeConstraint)
  maxAge: number;

  @Transform(({ value }) => parseInt(value))
  @IsNumber({}, { message: i18nValidationMessage('errors.COMMON.IS_NUMBER') })
  @Min(0, {
    message: i18nValidationMessage('errors.COMMON.MIN_NUMBER', { min: 0 }),
  })
  maxAthletes: number;

  @IsArray({ message: i18nValidationMessage('errors.COMMON.IS_ARRAY') })
  @ArrayNotEmpty({
    message: i18nValidationMessage('errors.COMMON.ARRAY_NOT_EMPTY'),
  })
  @IsEnum(WeekDays, {
    each: true,
    message: i18nValidationMessage('errors.COMMON.IS_ENUM'),
  })
  weekDays: WeekDays[];
}
