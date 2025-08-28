import { Transform } from 'class-transformer';
import { IsNumber, IsOptional, Min, Validate } from 'class-validator';

import { AgeConstraint } from '@ds-common/validators/age.validator';

export class AgeDto {
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(1)
  min: number;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(1)
  max: number;

  @Validate(AgeConstraint)
  validate(): void {}
}
