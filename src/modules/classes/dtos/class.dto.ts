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

import { AgeConstraint } from '@ds-common/validators/age.validator';
import { HourConstraint } from '@ds-common/validators/hour.validator';
import { WeekDays } from '@ds-enums/week-days.enum';

export class ClassDto {
  @IsMongoId()
  modality: Types.ObjectId;

  @IsMongoId()
  teacher: Types.ObjectId;

  @IsNotEmpty()
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'start must be in HH:MM format',
  })
  startHour: string;

  @IsNotEmpty()
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'end must be in HH:MM format',
  })
  @Validate(HourConstraint)
  endHour: string;

  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(1)
  minAge: number;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(1)
  @Validate(AgeConstraint)
  maxAge: number;

  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(1)
  maxAthletes: number;

  @IsArray()
  @ArrayNotEmpty()
  @IsEnum(WeekDays, { each: true })
  weekDays: WeekDays[];
}
