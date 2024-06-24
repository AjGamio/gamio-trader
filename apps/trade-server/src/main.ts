import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, RequestMethod } from '@nestjs/common';
import * as express from 'express';
import { join } from 'path';
import { SocketIoAdapter } from './adapters/socket.io.adapter';
import { EnvConfig } from 'gamio/domain/config/env.config';
import { setupSwagger } from 'gamio/domain/config/swagger.config';

/**
 * Bootstrap the NestJS application.
 */
async function bootstrap() {
  // Create the NestJS application instance
  const app = await NestFactory.create(AppModule);
  // Enable CORS for the application
  const corsOptions = {
    origin: EnvConfig.ALLOWED_ORIGINS, // Replace with your client's URL
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  };
  app.enableCors(corsOptions);
  app.setGlobalPrefix('api', {
    exclude: [
      { path: 'health', method: RequestMethod.GET },
      { path: 'login', method: RequestMethod.POST },
    ],
  });

  // Create a logger instance
  const logger = new Logger(EnvConfig.APP_NAME);

  // Set up Swagger documentation
  setupSwagger(app);

  // Start the application and listen on the specified port
  await app.listen(EnvConfig.PORT);

  // Configure the WebSocket adapter
  app.useWebSocketAdapter(new SocketIoAdapter(app));

  // Serve the Socket.IO client files
  app.use(
    '/socket.io-client',
    express.static(
      join(__dirname, '..', 'node_modules', 'socket.io-client', 'dist'),
    ),
  );

  // Log the application's running status
  const defaultHost = `http://localhost:${EnvConfig.PORT}`;
  logger.verbose(`Application is running on ${defaultHost}`);
}

// Start the application
bootstrap();
