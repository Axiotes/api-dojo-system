import { Module } from '@nestjs/common';

import { LoggerService } from './logger/logger.service';
import { ValidateFieldsService } from './validate-fields/validate-fields.service';
import { ReportService } from './report/report.service';
import { PuppeteerService } from './puppeteer/puppeteer.service';

@Module({
  providers: [
    LoggerService,
    ValidateFieldsService,
    ReportService,
    PuppeteerService,
  ],
  exports: [ValidateFieldsService, ReportService],
})
export class ServicesModule {}
