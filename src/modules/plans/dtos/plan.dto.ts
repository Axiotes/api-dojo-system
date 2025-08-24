import { IsEnum, IsMongoId, IsNumber } from 'class-validator';

import { Period } from '@ds-enums/period.enum';

export class PlanDto {
  @IsEnum(['monthly', 'annually'])
  period: Period;

  @IsNumber()
  periodQuantity: number;

  @IsNumber()
  value: number;

  @IsMongoId()
  modality: string;
}
