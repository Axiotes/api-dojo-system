import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { LoggerService } from './logger/logger.service';
import { ValidateFieldsService } from './validate-fields/validate-fields.service';
import { ReportService } from './report/report.service';
import { PuppeteerService } from './puppeteer/puppeteer.service';
import { EmailService } from './email/email.service';
import { TemplateService } from './template/template.service';

@Module({
  imports: [ConfigModule],
  providers: [
    LoggerService,
    ValidateFieldsService,
    ReportService,
    PuppeteerService,
    EmailService,
    TemplateService,
  ],
  exports: [ValidateFieldsService, ReportService, EmailService],
})
export class ServicesModule {}
