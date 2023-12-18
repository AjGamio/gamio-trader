// das.service.ts

import { Injectable, Logger } from '@nestjs/common';
import { TraderClient } from './client/trader-client';
import { ITcpCommand } from './interfaces/iCommand';
import { TraderCommandType } from './enums';
import { Socket } from 'socket.io';
import { EnvConfig } from 'apps/trade-server/src/config/env.config';
import { CommandData, CommandDictionary } from './interfaces/iData';
import {
  ITickerData,
  iTickerAverages,
} from '../polygon/interfaces/iTickerData';
import { TradeBotsService } from '../trade-bot/tradebot.service';
import { LoginDto } from './common';

@Injectable()
export class DasService {
  private commandDictionary: CommandDictionary = {};
  public traderClientConnectionStatus: 'Connected' | 'Not-Connected' =
    'Not-Connected';
  private traderClient: TraderClient;
  public client: Socket;
  private commandQueue: Array<ITcpCommand> = [];
  private isProcessingQueue: boolean = false;
  private logger = new Logger(DasService.name);
  public loginDto: LoginDto;
  constructor(private readonly tradeBotService: TradeBotsService) {
    this.traderClientConnectionStatus = 'Connected';
    this.logger.log(`Connected client with id: ${this.client?.id}`);
  }

  public setupTradeClient(loginDto: LoginDto) {
    this.loginDto = loginDto;
    this.initTradeClient();
  }

  private async processQueue(): Promise<void> {
    // Ensure only one command is processed at a time
    if (this.isProcessingQueue || this.commandQueue.length === 0) {
      return;
    }

    // Set flag to indicate that the queue is being processed
    this.isProcessingQueue = true;

    try {
      // Dequeue the next command
      const nextCommand = this.commandQueue.shift();
      this.commandDictionary[nextCommand.Type] = {
        commandType: nextCommand.Type,
        emitted: false,
      };
      // Process the command (replace this with your logic)
      await this.processCommand(nextCommand);
      this.isProcessingQueue = false;
      // Continue processing the queue recursively
      await this.processQueue();
    } catch (error) {
      // Handle errors
      this.logger.error('Error processing queue:', error);
    } finally {
      // Reset the flag when the queue processing is complete
      this.isProcessingQueue = false;
    }
  }

  private async processCommand(command: ITcpCommand): Promise<void> {
    // Replace this with your logic to send the command to the server
    this.logger.log(`Sending command:${command.Name}`);
    await this.sendCommandToServer(command);
  }

  public async initTradeClient() {
    this.traderClient = new TraderClient(
      this.tradeBotService,
      this.loginDto,
      EnvConfig.DAS.SERVER.ADDRESS,
      EnvConfig.DAS.SERVER.PORT,
    );
    await this.traderClient.connectAsync();
  }

  private setupEventHandlers(commandType: TraderCommandType) {
    // Subscribe to events from TraderClient
    if (this.traderClient) {
      this.traderClient.on(
        commandType.toString(),
        this.handleDataEmit.bind(this),
      );
    } else {
      throw new Error('Trader client is not connected');
    }
  }

  private handleDataEmit(data: CommandData) {
    if (EnvConfig.ENABLE_DEBUG) {
      this.logger.log('Event Data:', data);
    }
    if (this.client) {
      this.client.emit('onDasTraderEmit', data);
    }
  }

  connectToServer() {
    this.traderClient.connectAsync();
  }

  async sendCommandToServer(command: ITcpCommand) {
    if (this.traderClient) {
      this.traderClient.sendCommandAsync(command);
    } else {
      this.traderClientConnectionStatus = 'Not-Connected';
      throw new Error('Trader client is not connected');
    }
  }

  closeConnection(force?: boolean) {
    this.traderClient.dispose(force);
    this.traderClientConnectionStatus = 'Not-Connected';
  }

  public async delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // Public method to enqueue a command
  public enqueueCommand(command: ITcpCommand): void {
    if (command.Type === TraderCommandType.LOGIN_COMMAND) {
      if (this.traderClient) {
        this.closeConnection(true);
      }
      this.initTradeClient();
    }
    this.commandQueue.push(command);
    this.setupEventHandlers(command.Type);
    // Start processing the queue if not already processing
    if (!this.isProcessingQueue) {
      this.processQueue();
    }
  }

  public async emit(
    eventName: string,
    data: iTickerAverages | string | number | ITickerData[],
  ) {
    if (EnvConfig.ENABLE_DEBUG && this.client?.id) {
      this.logger.log(
        `emitting event to client with id: ${this.client?.id}, event-${eventName}`,
      );
      this.client?.emit(eventName, data);
    }
  }
}
