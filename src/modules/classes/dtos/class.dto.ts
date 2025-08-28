import { IsMongoId, IsNotEmpty, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { Types } from 'mongoose';

import { HourDto } from './hour.dto';
import { AgeDto } from './age.dto';

export class ClassDto {
  @IsMongoId()
  modality: Types.ObjectId;

  @IsMongoId()
  teacher: Types.ObjectId;

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => HourDto)
  hour: HourDto;

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => AgeDto)
  age: AgeDto;
}
