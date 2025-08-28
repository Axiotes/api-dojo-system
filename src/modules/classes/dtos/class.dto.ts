import {
  ArrayNotEmpty,
  IsArray,
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  Min,
  Validate,
  ValidateNested,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { Types } from 'mongoose';

import { HourDto } from './hour.dto';
import { AgeDto } from './age.dto';

import { AgeConstraint } from '@ds-common/validators/age.validator';
import { HourConstraint } from '@ds-common/validators/hour.validator';
import { WeekDays } from '@ds-enums/week-days.enum';

export class ClassDto {
  @IsMongoId()
  modality: Types.ObjectId;

  @IsMongoId()
  teacher: Types.ObjectId;

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => HourDto)
  @Validate(HourConstraint)
  hour: HourDto;

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => AgeDto)
  @Validate(AgeConstraint)
  age: AgeDto;

  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(1)
  maxAthletes: number;

  @IsArray()
  @ArrayNotEmpty()
  @IsEnum(WeekDays, { each: true })
  weekDays: WeekDays[];
}
