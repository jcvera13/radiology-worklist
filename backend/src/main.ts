import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: true, //Enable CORS for frontend
  });

  // Enable validation pipes globally
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Set global prefix for all routes
  app.setGlobalPrefix('api');

  const port = process.env.PORT || 3001;
  await app.listen(port);

  console.log(`
  ╔═══════════════════════════════════════════════════╗
  ║  Radiology Orchestration System - Backend API    ║
  ║  Running on: http://localhost:${port}              ║
  ║  API Docs: http://localhost:${port}/api           ║
  ║  WebSocket: ws://localhost:${port}                ║
  ╚═══════════════════════════════════════════════════╝
  `);
}

bootstrap();
