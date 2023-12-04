import { Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { DasService } from 'gamio/domain/das/das.service';
import { Server, Socket } from 'socket.io';
@WebSocketGateway({ cors: true })
export class DasGateway
  implements
    OnGatewayConnection,
    OnGatewayDisconnect,
    OnModuleInit,
    OnModuleDestroy
{
  private logger = new Logger(this.constructor.name);
  constructor(private readonly dasService: DasService) {}
  onModuleInit() {
    this.logger.verbose(
      `Trade client status - ${this.dasService.traderClientConnectionStatus}`,
    );
  }
  onModuleDestroy() {
    if (this.dasService.traderClientConnectionStatus === 'Connected') {
      this.dasService.closeConnection(true);
    }
    this.logger.verbose(
      `Trade client status - ${this.dasService.traderClientConnectionStatus}`,
    );
  }

  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    // Handle WebSocket connection
    this.dasService.client = client;
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    // Handle WebSocket disconnection
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('testMessage')
  handleTestMessage(client: Socket, message: string): void {
    this.logger.log('Received message from client:', message);

    // Process the message and send a response
    const response = `Server received: ${message}`;
    client.emit('testMessageResponse', response);
  }
}
