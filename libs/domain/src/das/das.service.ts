// das.service.ts

import { FilterQuery, Model } from 'mongoose';
import { Socket } from 'socket.io';

import {
  Injectable,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { EnvConfig } from '../config/env.config';
import {
  iTickerAverages,
  ITickerData,
} from '../polygon/interfaces/iTickerData';
import { PolygonApiService } from '../polygon/polygon.service';
import { TradeBotOrder } from '../trade-bot/tradeBotOder.entity';
import { TradeBotsService } from '../trade-bot/tradeBot.service';
import { TraderClient } from './client/trader-client';
import { LoginDto } from './common';
import { TraderCommandType } from './enums';
import { ITcpCommand } from './interfaces/iCommand';
import {
  CommandData,
  CommandDictionary,
} from './interfaces/iData';
import { POSRefreshCommand } from './commands/pos.refresh.command';
import { Position } from '../trade-bot/positionEntity';

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
  constructor(
    private readonly polygonService: PolygonApiService,
    private readonly tradeBotService: TradeBotsService,
    @InjectModel(TradeBotOrder.name)
    private readonly tradeBotOrderModel: Model<TradeBotOrder>,
  ) {
    this.traderClientConnectionStatus = 'Connected';
    this.logger.log(`Connected client with id: ${this.client?.id}`);
  }

  public setupTradeClient(loginDto: LoginDto) {
    this.loginDto = loginDto;
    this.initTradeClient();
  }

  public getPositions(options: {
    skip: number;
    limit: number;
    sort: {
      [x: string]: number;
    };
    where?: FilterQuery<Position>;
  }): Promise<{ records: Position[]; total: number; }> {
    return this.tradeBotService.findAllPositions(options);
  }

  public posRefresh(): void {
    const posRefreshCommand = POSRefreshCommand.Instance;
    this.logger.log(posRefreshCommand.Name);
    this.enqueueCommand(posRefreshCommand);
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
      this.polygonService,
      this.tradeBotService,
      this.loginDto,
      EnvConfig.DAS.SERVER.ADDRESS,
      EnvConfig.DAS.SERVER.PORT,
    );
    await this.traderClient.connectAsync();
    this.traderClient.on('trade-data', (data) => {
      if (this.client && this.client.id) {
        this.client.emit('trade-data', data);
      }
    });
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
    }

    if (this.client?.id) {
      this.client?.emit(eventName, data);
    }
  }

  async addBotOrder(order: TradeBotOrder) {
    let tickerOrderMsg = '';
    try {
      const result = await this.tradeBotOrderModel.collection.insertOne(order);

      if (result.acknowledged) {
        tickerOrderMsg = `Added new order for bot - ${order.botId} for symbol- ${order.symbol}`;
        if (EnvConfig.ENABLE_DEBUG) {
          this.logger.log(tickerOrderMsg);
        }
      } else {
        tickerOrderMsg = `Unable to add new order for bot - ${order.botId} for symbol- ${order.symbol}`;
        if (EnvConfig.ENABLE_DEBUG) {
          this.logger.warn(tickerOrderMsg);
        }
      }
      if (tickerOrderMsg.length > 0) {
        this.emit('ticker-info', tickerOrderMsg);
      }
      return order;
    } catch (err) {
      tickerOrderMsg = `Unable to add new order for bot - ${order.botId} for symbol- ${order.symbol} due to ${err.message}`;
      this.logger.error(tickerOrderMsg);
    }
  }
}
