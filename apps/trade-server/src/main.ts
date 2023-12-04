import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { setupSwagger } from './config/swagger.config';
import { EnvConfig } from './config/env.config';
import { Logger } from '@nestjs/common';
import * as express from 'express';
import { join } from 'path';
// import { NestExpressApplication } from '@nestjs/platform-express';
import { SocketIoAdapter } from './adapters/socket.io.adapter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // app.use(cors());

  // Enable CORS
  const corsOptions = {
    origin: EnvConfig.ALLOWED_ORIGIN, // Replace with your client's URL
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type'],
  };
  app.enableCors(corsOptions);

  const logger = new Logger(EnvConfig.APP_NAME);
  setupSwagger(app);
  // Enable CORS for all routes
  await app.listen(EnvConfig.PORT);
  app.useWebSocketAdapter(new SocketIoAdapter(app));
  // Serve the Socket.IO client files
  app.use(
    '/socket.io-client',
    express.static(
      join(__dirname, '..', 'node_modules', 'socket.io-client', 'dist'),
    ),
  );
  // Enable CORS with specific options
  // app.use(cors(corsOptions));
  const defaultHost = `http://localhost:${EnvConfig.PORT}`;
  logger.verbose(`Application is running on ${defaultHost}`);
}
bootstrap();
