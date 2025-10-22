import { Module } from '@nestjs/common';

import { AgeConstraint } from './age.validator';
import { HourConstraint } from './hour.validator';
import { AgeParamConstraint } from './age-param.validator';
import { HourParamConstraint } from './hour-param.validator';

import { ServicesModule } from '@ds-services/services.module';

@Module({
  imports: [ServicesModule],
  providers: [
    AgeConstraint,
    AgeParamConstraint,
    HourConstraint,
    HourParamConstraint,
  ],
  exports: [
    AgeConstraint,
    AgeParamConstraint,
    HourConstraint,
    HourParamConstraint,
  ],
})
export class ValidatorsModule {}
