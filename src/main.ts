import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  DocumentBuilder,
  SwaggerCustomOptions,
  SwaggerModule,
} from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');

  const config = new DocumentBuilder()
    .setTitle('HustCode API Docs')
    .setDescription('HustCode API Docs')
    .setVersion('1.0')
    .build();

  const customOptions: SwaggerCustomOptions = {
    swaggerOptions: {
      persistAuthorization: true,
    },
    customSiteTitle: 'HustCode API Docs',
  };

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, customOptions);

  const configService = app.get(ConfigService);
  const port = configService.get<number>('port') || 3000;

  await app.listen(port, () => {
    Logger.log(`Server is running at http://localhost:${port}`);
    Logger.log(`Swagger is running at http://localhost:${port}/api/docs`);
  });
}
bootstrap();
