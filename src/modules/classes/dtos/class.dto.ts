import { IsNotEmpty, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

import { HourDto } from './hour.dto';

export class ClassDto {
  //   @IsMongoId()
  //   modality: Types.ObjectId;

  //   @IsMongoId()
  //   teacher: Types.ObjectId;

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => HourDto)
  hour: HourDto;
}
