import { EventEmitter } from 'events';
import { EnvConfig } from 'gamio/domain/config/env.config';
import { PolygonApiService } from 'gamio/domain/polygon/polygon.service';
import {
  TradeStatus,
  TradeType,
} from 'gamio/domain/trade-bot/tradeBotOder.entity';

import { TradeOrder } from 'gamio/domain/trade-bot/tradeOrder.entity';
import { isNil, set } from 'lodash';
import * as net from 'net';

import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';

import { LoginCommand } from '../commands';
import { CommandResult } from '../commands/command.result';
import { LoginDto } from '../common';
import { getTradeStatusFromString } from '../common/trade.helper';
import { TraderCommandType } from '../enums';
import { ITcpCommand } from '../interfaces/iCommand';
import { ICommandResult } from '../interfaces/iCommand.result';
import {
  JsonData,
  Order,
  Position,
  PositionWithPrice,
  Trade,
} from '../interfaces/iData';
import { ResponseEventArgs } from '../processors/response.event.args';
import { TradeBotsService } from 'gamio/domain/trade-bot/tradeBot.service';

@Injectable()
export class TraderClient extends EventEmitter implements OnModuleDestroy {
  private loginAttempted: boolean = false;
  private readonly defaultTimeOutInSeconds = 1;
  private isLoggedIn: boolean = false;
  private readonly _ipEndPoint: net.AddressInfo;
  private readonly _tcpClient: net.Socket;
  private _currentStream: net.Socket | null = null;
  private _timeOut: Date;
  private logger: Logger;
  constructor(
    private readonly polygonService: PolygonApiService,
    private readonly tradeBotService: TradeBotsService,
    private readonly loginDto: LoginDto,
    ipAddress: string,
    port: number,
    timeOut?: number,
  ) {
    super();
    this._timeOut = new Date(
      Date.now() + (timeOut || this.defaultTimeOutInSeconds) * 1000,
    );
    this._ipEndPoint = { address: ipAddress, port: port, family: 'ipv4' };
    this._tcpClient = new net.Socket();
    this._tcpClient.setMaxListeners(EnvConfig.MAX_LISTENERS_COUNT); // Set to a number higher than the expected number of listeners
    this.setMaxListeners(EnvConfig.MAX_LISTENERS_COUNT); // Increase the max listeners for this instance as well
    this.logger = new Logger(this.constructor.name);
  }

  async connectAsync(): Promise<void> {
    this.dispose();
    return new Promise<void>((resolve, reject) => {
      this._tcpClient.connect(
        this._ipEndPoint.port,
        this._ipEndPoint.address,
        () => {
          this.logger.log('Connecting to the server');
          resolve();
        },
      );

      this._tcpClient.on('connect', () => {
        this.logger.log('Connected to the server');
      });

      this._tcpClient.on('error', (err) => {
        this.logger.warn('Error:', err.message);
        reject(err);
      });
      // Removing the event listener when no longer needed
      this._tcpClient.removeListener('disconnect', () => {});
      this._tcpClient.removeListener('error', () => {});
      this._tcpClient.on('data', async (data) => {
        const eventData = new ResponseEventArgs(
          TraderCommandType.None,
          data.toString(),
        );
        if (EnvConfig.ENABLE_DEBUG) {
          this.logger.log(eventData.data);
        }
        const jsonData = eventData.data as JsonData;
        const updatedData = await this.updateDataWithStockDetails(jsonData);
        set(jsonData, 'POS', updatedData);
        await Promise.allSettled(
          updatedData.map(
            async (d: any) =>
              await this.tradeBotService.updatePosition(d.symb, d.type, d),
          ),
        );
        this.emit('trade-data', {
          BP: jsonData.BP,
          Clients: jsonData.Clients,
          STATUS: jsonData.STATUS,
        });

        const { Order: orders, Trade: trades } = jsonData;
        this.processOrderData(orders);
        this.processTradeData(trades, orders);
      });
    });
  }

  /**
   * Processes trade data and updates orders accordingly.
   * @param {Trade[]} trades - Array of trade data to process.
   * @param {Order[]} orders - Array of orders to update based on trade data.
   * @returns {void}
   */
  private processTradeData(trades: Trade[], orders: Order[]) {
    trades.forEach((t: Trade) => {
      const order = orders.find((o) => o.id === t.orderid.toFixed());
      if (!isNil(order)) {
        const status = getTradeStatusFromString(order.status);
        const orderToken = order.id === 'Send_Rej' ? order['b/s'] : order.id;
        const orderStatus =
          order.id === 'Send_Rej' ? TradeStatus.REJECTED : status;
        const trade: Partial<TradeOrder> = {
          id: t.id,
          token: orderToken,
          symb: t.symb,
          bs: t['b/s'],
          mktLmt: t['mkt/lmt'],
          qty: isNaN(t.qty) ? 0 : Number(t.qty),
          lvqty: 0,
          cxlqty: 0,
          price: isNaN(t.price) ? 0 : Number(t.price),
          route: t.route,
          time: t.time,
          type: TradeType.TRADE,
          status: orderStatus,
          // createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        this.tradeBotService.upsertBotOrder(trade as TradeOrder);
      }
    });
  }

  /**
   * Processes an array of orders and performs necessary operations.
   * @param {Order[]} orders - The array of orders to process.
   * @returns {void}
   */
  private processOrderData(orders: Order[]) {
    orders.forEach((o: Order) => {
      const status = getTradeStatusFromString(o.status);
      const orderToken = o.token === 'Send_Rej' ? o['b/s'] : o.token;
      const orderStatus =
        o.token === 'Send_Rej' ? TradeStatus.REJECTED : status;
      this.tradeBotService.updateTradeBotOrder(orderToken, o.id, status);
      const trade: Partial<TradeOrder> = {
        id: o.id,
        token: orderToken,
        symb: o.symb,
        bs: o['b/s'],
        mktLmt: o['mkt/lmt'],
        qty: isNaN(o.qty) ? 0 : Number(o.qty),
        lvqty: isNaN(o.lvqty) ? 0 : Number(o.lvqty),
        cxlqty: isNaN(o.cxlqty) ? 0 : Number(o.cxlqty),
        price: isNaN(o.price) ? 0 : Number(o.price),
        route: o.route,
        status: orderStatus,
        time: o.time,
        type: TradeType.ORDER,
        // createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      this.tradeBotService.upsertBotOrder(trade as TradeOrder);
    });
  }

  getStream(): net.Socket {
    return this._currentStream || (this._currentStream = this._tcpClient);
  }

  async sendCommandAsync(command: ITcpCommand): Promise<ICommandResult> {
    let result: ICommandResult | null = null;
    const commandText = command.ToString();
    this.logger.log(` ${new Date().toUTCString()}|>>| ${commandText}`);
    try {
      this.logger.log(`Command:${commandText}`);
      await this.checkAndInitConnection();
      this._tcpClient.write(commandText);
    } catch (e) {
      this.logger.error(e);
      result = new CommandResult();
      result.Message = e.message;
      result.Success = false;
    } finally {
      // command.Unsubscribe(this._responseProcessor);
    }

    return result || CommandResult.SuccessResult;
  }

  private async checkAndInitConnection() {
    // if (data.isLoggedIn) {
    //   this.isLoggedIn = data.isLoggedIn;
    // }
    if (!this.isLoggedIn && !this.loginAttempted) {
      this.loginAttempted = true;
      this.logger.warn(`trying DAS server login .... `);
      if (
        this.loginDto &&
        this.loginDto.username &&
        this.loginDto.password &&
        this.loginDto.account
      ) {
        await this.sendCommandAsync(
          new LoginCommand(
            this.loginDto.username,
            this.loginDto.password,
            this.loginDto.account,
          ),
        );
      } else {
        this.logger.warn(`DAS server login credentials not found`);
      }
    }
  }

  private async calculateRealizedAndUnrealized(
    position: Position,
  ): Promise<void> {
    let realized = 0;
    let unrealized = 0;

    // Fetch current price for the symbol
    const currentPrices = await this.polygonService.getCurrentPrices(
      position.symb,
    );

    switch (position.type) {
      case 1: // Buy
        // No realized profit or loss for buy positions
        break;
      case 2: // Sell Margin
      case 3: // Buy Short
        // Calculate realized profit or loss
        realized += position.Realized != null ? position.Realized : 0;
        break;
    }

    // Calculate unrealized value for the position
    if (position.qty > 0 && currentPrices != null) {
      switch (position.type) {
        case 3:
          unrealized =
            position.avgcost * position.qty -
            position.qty * currentPrices.currentPrice;
          break;
        case 2: // Sell Margin
        default:
          unrealized =
            position.qty * currentPrices.currentPrice -
            position.avgcost * position.qty;
          break;
      }
    }

    set(position, 'Realized', realized);
    set(position, 'UnRealized', unrealized);
    set(position, 'BidPrice', currentPrices.bidPrice);
    set(position, 'AskPrice', currentPrices.askPrice);
    set(position, 'CurrentPrice', currentPrices.currentPrice);
  }

  onModuleDestroy() {
    this.dispose();
  }

  public dispose(force?: boolean) {
    if (
      (this._currentStream && this._currentStream.eventNames()?.length === 0) ||
      force
    ) {
      this.logger.verbose('closing connection');
      this._currentStream.destroy();
      this._currentStream = null;
    } else {
      this.logger.fatal(
        'can not close connection, there are active events in queue',
      );
    }
  }

  /**
   * Updates the data by fetching additional stock details and calculating realized and unrealized values.
   * @param {object} jsonData - The input data containing POS array.
   * @returns {Promise<PositionWithPrice[]>} - The updated data with additional stock details.
   */
  private async updateDataWithStockDetails(
    jsonData: JsonData,
  ): Promise<PositionWithPrice[]> {
    const updatedData: PositionWithPrice[] = [];

    // Iterate over each POS item
    for (const s of jsonData.POS) {
      // Calculate realized and unrealized values
      await this.calculateRealizedAndUnrealized(s);

      // Fetch stock details from the polygon service
      const tickerDetails = await this.polygonService.getStockDetails(s.symb);

      // If ticker details are found, add them to the current POS item
      if (tickerDetails) {
        const {
          name,
          market,
          primary_exchange,
          currency_name,
          sic_description,
        } = tickerDetails;

        // Merge ticker details with the current POS item
        updatedData.push({
          ...s,
          name,
          market,
          primary_exchange,
          currency_name,
          sic_description,
        });
      } else {
        // Log an error message if ticker details are not found
        this.logger.error(`Ticker detail for ${s.symb} not found.`);
      }
    }

    return updatedData;
  }
}
