import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, OpenAPIObject, SwaggerModule } from '@nestjs/swagger';

import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('Dojo System API')
    .setDescription(
      `API REST desenvolvida para sistema para gerenciamento de academias de lutas, permitindo às academias se organizarem de forma simples e eficiente. 
      Além disso, oferece uma plataforma para alunos e visitantes interagirem com as academias.`,
    )
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const documentFactory = (): OpenAPIObject =>
    SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, documentFactory);

  await app.listen(3000);
}
bootstrap();
