import { Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { DasService } from 'gamio/domain/das/das.service';
import { Server, Socket } from 'socket.io';
import { LoginCommand, LogoutCommand } from 'gamio/domain/das/commands';
import { EnvConfig } from 'gamio/domain/config/env.config';

/**
 * WebSocket gateway for handling DAS (Direct Access Service) events.
 */
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

  /**
   * Lifecycle hook called once the module has been initialized.
   * Logs the trade client status.
   */
  onModuleInit() {
    this.logger.verbose(
      `Trade client status - ${this.dasService.traderClientConnectionStatus}`,
    );
    const loginCommand = new LoginCommand(
      EnvConfig.DAS.USERNAME,
      EnvConfig.DAS.PASSWORD,
      EnvConfig.DAS.ACCOUNT,
    );
    this.dasService.enqueueCommand(loginCommand);
  }

  /**
   * Lifecycle hook called once the module is being destroyed.
   * Closes the trade client connection if it's still connected.
   * Logs the trade client status.
   */
  onModuleDestroy() {
    if (this.dasService.traderClientConnectionStatus === 'Connected') {
      this.dasService.enqueueCommand(LogoutCommand.Instance);
      this.dasService.closeConnection(true);
    }
    this.logger.verbose(
      `Trade client status - ${this.dasService.traderClientConnectionStatus}`,
    );
  }

  @WebSocketServer()
  server: Server;

  /**
   * Handles WebSocket connection.
   * @param client - The connected WebSocket client
   */
  handleConnection(client: Socket) {
    const token = client.handshake.auth;
    console.log(
      '🚀 ~ file: das.gateway.ts:69 ~ handleConnection ~ token:',
      token,
    );
    this.dasService.client = client;
    this.logger.log(`Client connected: ${this.dasService.client.id}`);
  }

  /**
   * Handles WebSocket disconnection.
   * @param client - The disconnected WebSocket client
   */
  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  /**
   * Handles a custom 'testMessage' WebSocket message from the client.
   * @param client - The WebSocket client
   * @param message - The received message
   */
  @SubscribeMessage('testMessage')
  handleTestMessage(client: Socket, message: string): void {
    this.logger.log('Received message from client:', message);

    // Process the message and send a response
    const response = `Server received: ${message}`;
    client.emit('testMessageResponse', response);
  }
}
