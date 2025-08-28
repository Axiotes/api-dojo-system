import { IsNotEmpty, IsString, Matches, Validate } from 'class-validator';

import { HourConstraint } from '@ds-common/validators/hour.validator';

export class HourDto {
  @IsNotEmpty()
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'start must be in HH:MM format',
  })
  start: string;

  @IsNotEmpty()
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'end must be in HH:MM format',
  })
  end: string;

  @Validate(HourConstraint)
  validate(): void {}
}
