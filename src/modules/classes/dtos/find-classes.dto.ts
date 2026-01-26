import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  Min,
  Validate,
} from 'class-validator';
import { Types } from 'mongoose';
import { i18nValidationMessage } from 'nestjs-i18n';

import { HourParamConstraint } from '@ds-common/validators/hour-param.validator';
import { AgeParamConstraint } from '@ds-common/validators/age-param.validator';

export class FindClassesDto {
  @ApiProperty({ description: 'docs.COMMON.SKIP_DESCRIPTION' })
  @Transform(({ value }) => parseInt(value))
  @IsNumber({}, { message: i18nValidationMessage('errors.COMMON.IS_NUMBER') })
  @Min(0, {
    message: i18nValidationMessage('errors.COMMON.MIN_NUMBER', { min: 0 }),
  })
  skip: number;

  @ApiProperty({ description: 'docs.COMMON.LIMIT_DESCRIPTION' })
  @Transform(({ value }) => parseInt(value))
  @IsNumber({}, { message: i18nValidationMessage('errors.COMMON.IS_NUMBER') })
  @Min(1, {
    message: i18nValidationMessage('errors.COMMON.MIN_NUMBER', { min: 1 }),
  })
  limit: number;

  @ApiPropertyOptional({ description: 'docs.COMMON.STATUS_DESCRIPTION' })
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean({ message: i18nValidationMessage('errors.COMMON.IS_BOOLEAN') })
  status: boolean;

  @ApiPropertyOptional({
    description: 'docs.COMMON.MODALITY_DESCRIPTION',
    example: '64f1b2a3c4d5e6f7890abc12',
  })
  @IsOptional()
  @IsMongoId({ message: i18nValidationMessage('errors.COMMON.INVALID_ID') })
  modality: Types.ObjectId;

  @ApiPropertyOptional({
    description: 'docs.CLASSES.MIN_AGE_PROPERTY',
    example: 8,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber({}, { message: i18nValidationMessage('errors.COMMON.IS_NUMBER') })
  @Min(1, {
    message: i18nValidationMessage('errors.COMMON.MIN_NUMBER', { min: 1 }),
  })
  @Validate(AgeParamConstraint)
  minAge: number;

  @ApiPropertyOptional({
    description: 'docs.CLASSES.MAX_AGE_PROPERTY',
    example: 4,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber({}, { message: i18nValidationMessage('errors.COMMON.IS_NUMBER') })
  @Min(1, {
    message: i18nValidationMessage('errors.COMMON.MIN_NUMBER', { min: 1 }),
  })
  @Validate(AgeParamConstraint)
  maxAge: number;

  @ApiPropertyOptional({
    description: 'docs.CLASSES.START_HOUR_PROPERTY',
    example: '17:00',
  })
  @IsOptional()
  @IsNotEmpty({
    message: i18nValidationMessage('errors.COMMON.IS_STRING'),
  })
  @IsString({
    message: i18nValidationMessage('errors.COMMON.IS_STRING'),
  })
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: i18nValidationMessage('errors.COMMON.MATCH_HOUR'),
  })
  @Validate(HourParamConstraint)
  startHour: string;

  @ApiPropertyOptional({
    description: 'docs.CLASSES.END_HOUR_PROPERTY',
    example: '18:00',
  })
  @IsOptional()
  @IsNotEmpty({
    message: i18nValidationMessage('errors.COMMON.IS_STRING'),
  })
  @IsString({
    message: i18nValidationMessage('errors.COMMON.IS_STRING'),
  })
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: i18nValidationMessage('errors.COMMON.MATCH_HOUR'),
  })
  @Validate(HourParamConstraint)
  endHour: string;

  @ApiPropertyOptional({
    description: 'docs.CLASSES.WEEKDAYS_PROPERTY',
    type: [String],
    example: ['Segunda-feira', 'Terça-feira'],
  })
  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.split(',') : value,
  )
  @IsArray({ message: i18nValidationMessage('errors.COMMON.IS_ARRAY') })
  @ArrayNotEmpty({
    message: i18nValidationMessage('errors.COMMON.ARRAY_NOT_EMPTY'),
  })
  @IsString({ each: true })
  weekDays: string[];
}
