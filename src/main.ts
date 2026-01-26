import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';
import { I18nValidationExceptionFilter, I18nValidationPipe } from 'nestjs-i18n';
import { useContainer } from 'class-validator';

import { AppModule } from './app.module';

import { LoggerService } from '@ds-services/logger/logger.service';
import { ErrorLogsInterceptor } from '@ds-common/interceptors/error-logs/error-logs.interceptor';
import { CombinedLogsInterceptor } from '@ds-common/interceptors/combined-logs/combined-logs.interceptor';
import { TranslateService } from '@ds-services/translate/translate.service';
import { I18nFiles } from '@ds-enums/i18n-files.enum';
import { UserMessage } from '@ds-enums/user-message.enum';
import { ModuleName } from '@ds-enums/module-name.enum';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const translateService = app.get(TranslateService);

  app.useGlobalPipes(
    new I18nValidationPipe({
      transform: true,
      whitelist: true,
    }),
  );
  app.useGlobalFilters(
    new I18nValidationExceptionFilter({
      errorFormatter: (validationErrors): string[] => {
        return validationErrors.flatMap((err) =>
          Object.values(err.constraints),
        );
      },
      errorHttpStatusCode: 400,
    }),
  );
  useContainer(app.select(AppModule), { fallbackOnErrors: true });
  app.use(cookieParser());

  const logger = app.get(LoggerService);
  app.useGlobalInterceptors(new ErrorLogsInterceptor(logger));
  app.useGlobalInterceptors(new CombinedLogsInterceptor(logger));

  app.setGlobalPrefix('api/v1');

  const config = new DocumentBuilder()
    .setTitle('Dojo System API')
    .setDescription(
      translateService.translate({
        i18nFile: I18nFiles.DOCS,
        module: ModuleName.SWAGGER,
        message: UserMessage.DESCRIPTION,
      }),
    )
    .setVersion('1.0')
    .build();

  let document = SwaggerModule.createDocument(app, config);
  document = translateService.translateSwaggerDocument(document, 'pt-BR');
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(3000);
}
bootstrap();
