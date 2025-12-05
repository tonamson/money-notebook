import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import * as fs from 'fs';
import * as path from 'path';

async function bootstrap() {
  // SSL configuration (production)
  const isProd = process.env.NODE_ENV === 'production';
  const sslPath = path.join(__dirname, '..', '..', '..', 'ssl');

  let httpsOptions: { key: Buffer; cert: Buffer } | undefined = undefined;
  if (isProd && fs.existsSync(path.join(sslPath, 'fullchain.pem'))) {
    httpsOptions = {
      key: fs.readFileSync(path.join(sslPath, 'privkey.pem')),
      cert: fs.readFileSync(path.join(sslPath, 'fullchain.pem')),
    };
    console.log('🔒 SSL enabled');
  }

  const app = await NestFactory.create(AppModule, { httpsOptions });

  // CORS
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      'http://moneynote.local:8888',
      'https://moneynote.store',
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-User-Code'],
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('Money Notebook API')
    .setDescription('API quản lý thu chi cá nhân')
    .setVersion('1.0')
    .addTag('auth', 'Xác thực người dùng')
    .addTag('categories', 'Quản lý danh mục')
    .addTag('transactions', 'Quản lý giao dịch')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Nhập JWT token',
      },
      'bearer',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT', 2053);
  const protocol = httpsOptions ? 'https' : 'http';
  await app.listen(port);
  console.log(`🚀 Application is running on: ${protocol}://localhost:${port}/`);
  console.log(
    `📚 Swagger docs available at: ${protocol}://localhost:${port}/docs`,
  );
}
bootstrap();
