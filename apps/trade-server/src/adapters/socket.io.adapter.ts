// socket-io.adapter.ts
import { IoAdapter } from '@nestjs/platform-socket.io';
import * as socketIo from 'socket.io';
import { ServerOptions } from 'socket.io';
import { INestApplication, Logger } from '@nestjs/common';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import { EnvConfig } from '../config/env.config';

export class SocketIoAdapter extends IoAdapter {
  createIOServer(
    port: number,
    options?: ServerOptions & { namespace?: string },
  ): any {
    const logger = new Logger(this.constructor.name);
    const server = super.createIOServer(port, options);

    const app: INestApplication =
      options && options.namespace
        ? options && options.namespace
        : this.httpServer;

    const corsOptions = {
      origin: EnvConfig.ALLOWED_ORIGIN, // Replace with your client's URL
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      allowedHeaders: ['Content-Type'],
    };

    app.enableCors(corsOptions);

    if (options && options.namespace) {
      const namespace = options.namespace;

      server.of(namespace).on('connection', (socket: socketIo.Socket) => {
        // Access the clientId from the query parameters
        const clientId = socket.handshake.query.clientId;
        logger.log(
          `Client connected to namespace ${namespace} with ID: ${clientId}`,
        );

        // Handle your connection logic here

        socket.on('disconnect', () => {
          logger.log(
            `Client disconnected from namespace ${namespace} with ID: ${clientId}`,
          );
          // Handle your disconnection logic here
        });
      });
    }

    return server;
  }
}
