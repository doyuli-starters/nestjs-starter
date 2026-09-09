import { NestFactory, Reflector } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module.js';
import { LoggerService } from './common/logger/index.js';
import {
  TransformInterceptor,
  LoggingInterceptor,
  TimeoutInterceptor,
} from './common/interceptors/index.js';
import { AllExceptionFilter } from './common/filters/index.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  const reflector = app.get(Reflector);

  const logger = app.get(LoggerService);
  app.useLogger(logger);

  app.useGlobalFilters(new AllExceptionFilter());
  app.useGlobalInterceptors(
    new TransformInterceptor(),
    new LoggingInterceptor(),
    new TimeoutInterceptor(reflector),
  );
  app.useGlobalPipes(new ValidationPipe());
  app.enableShutdownHooks();
  app.enableCors();

  const port = process.env.PORT ?? 3001;
  await app.listen(port);
  logger.log(
    `Application is running on: http://localhost:${port}`,
    'Bootstrap',
  );
}
await bootstrap();
