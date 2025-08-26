import { Module } from '@nestjs/common';

import { LoggerService } from './logger/logger.service';
import { ValidateFieldsService } from './validate-fields/validate-fields.service';

@Module({
  providers: [LoggerService, ValidateFieldsService],
  exports: [ValidateFieldsService],
})
export class ServicesModule {}
