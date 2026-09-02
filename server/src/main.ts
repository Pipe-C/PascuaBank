import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Permitir peticiones desde Vite Frontend
  app.enableCors();

  // Validación y transformación de DTOs global
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Documentación OpenAPI / Swagger
  const config = new DocumentBuilder()
    .setTitle('PascuaBank API')
    .setDescription('Especificación REST para operaciones de cuentas y transacciones bancarias')
    .setVersion('1.0')
    .addTag('Cuentas Bancarias')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(process.env.PORT || 3000);
}
bootstrap();