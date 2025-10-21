import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, OpenAPIObject, SwaggerModule } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';
import { I18nValidationExceptionFilter, I18nValidationPipe } from 'nestjs-i18n';

import { AppModule } from './app.module';

import { LoggerService } from '@ds-services/logger/logger.service';
import { ErrorLogsInterceptor } from '@ds-common/interceptors/error-logs/error-logs.interceptor';
import { CombinedLogsInterceptor } from '@ds-common/interceptors/combined-logs/combined-logs.interceptor';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new I18nValidationPipe({
      transform: true,
      whitelist: true,
    }),
  );
  app.useGlobalFilters(
    new I18nValidationExceptionFilter({
      errorFormatter: (validationErrors): string[] => {
        const messages = validationErrors.map((err) =>
          Object.values(err.constraints).join(', '),
        );
        return messages;
      },
      errorHttpStatusCode: 400,
    }),
  );
  app.use(cookieParser());

  const logger = app.get(LoggerService);
  app.useGlobalInterceptors(new ErrorLogsInterceptor(logger));
  app.useGlobalInterceptors(new CombinedLogsInterceptor(logger));

  app.setGlobalPrefix('api/v1');

  const config = new DocumentBuilder()
    .setTitle('Dojo System API')
    .setDescription(
      `API REST desenvolvida para sistema para gerenciamento de academias de lutas, permitindo às academias se organizarem de forma simples e eficiente. 
      Além disso, oferece uma plataforma para alunos e visitantes interagirem com as academias.`,
    )
    .setVersion('1.0')
    .build();

  const documentFactory = (): OpenAPIObject =>
    SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, documentFactory);

  await app.listen(3000);
}
bootstrap();
