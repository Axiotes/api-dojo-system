import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { LoggerService } from './logger/logger.service';
import { ValidateFieldsService } from './validate-fields/validate-fields.service';
import { ReportService } from './report/report.service';
import { PuppeteerService } from './puppeteer/puppeteer.service';
import { EmailService } from './email/email.service';
import { TemplateService } from './template/template.service';
import { TranslateService } from './translate/translate.service';

@Module({
  imports: [ConfigModule],
  providers: [
    LoggerService,
    ValidateFieldsService,
    ReportService,
    PuppeteerService,
    EmailService,
    TemplateService,
    TranslateService,
  ],
  exports: [
    ValidateFieldsService,
    ReportService,
    EmailService,
    TranslateService,
  ],
})
export class ServicesModule {}
