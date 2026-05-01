import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { loadEnvFile } from './env';
import session from 'express-session';
import express from 'express';
import { join } from 'path';

loadEnvFile();

async function bootstrap() {
  const password = process.env.DB_PASSWORD;

  if (!password) {
    throw new Error(
      'DB_PASSWORD environment variable is required for session secret',
    );
  }

  const app = await NestFactory.create(AppModule);
  app.use(express.static(join(process.cwd(), 'public')));
  app.use(
    session({
      secret: password,
      resave: false,
      saveUninitialized: false,
    }),
  );
  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
