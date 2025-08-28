import {
  ArrayNotEmpty,
  IsArray,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsString,
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
  @IsString({ each: true })
  weekDays: string[];
}
