import { Module } from '@nestjs/common';

import { LoggerService } from './logger/logger.service';
import { ValidateFieldsService } from './validate-fields/validate-fields.service';
import { ReportService } from './report/report.service';

@Module({
  providers: [LoggerService, ValidateFieldsService, ReportService],
  exports: [ValidateFieldsService, ReportService],
})
export class ServicesModule {}
