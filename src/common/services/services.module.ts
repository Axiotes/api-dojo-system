import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { LoggerService } from './logger/logger.service';
import { ValidateFieldsService } from './validate-fields/validate-fields.service';
import { ReportService } from './report/report.service';
import { PuppeteerService } from './puppeteer/puppeteer.service';
import { EmailService } from './email/email.service';

@Module({
  imports: [ConfigModule],
  providers: [
    LoggerService,
    ValidateFieldsService,
    ReportService,
    PuppeteerService,
    EmailService,
  ],
  exports: [ValidateFieldsService, ReportService, EmailService],
})
export class ServicesModule {}
