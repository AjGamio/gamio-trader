import * as net from 'net';
import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { EventEmitter } from 'events';
import { ITcpCommand } from '../interfaces/iCommand';
import { ICommandResult } from '../interfaces/iCommand.result';
import { CommandResult } from '../commands/command.result';
import { TraderCommandType } from '../enums';
import { LoginCommand } from '../commands';
import { LoginDto } from '../common';
import { ResponseEventArgs } from '../processors/response.event.args';
import { JsonData, Order, Trade } from '../interfaces/iData';
import { set } from 'lodash';
import { PolygonApiService } from 'gamio/domain/polygon/polygon.service';
import { TradeBotsService } from 'gamio/domain/trade-bot/tradebot.service';
import {
  TradeStatus,
  TradeType,
} from 'gamio/domain/trade-bot/tradeBotOder.entity';
import { TradeOrder } from 'gamio/domain/trade-bot/tradeOrder.entity';
import { EnvConfig } from 'gamio/domain/config/env.config';

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
      this._tcpClient.on('data', async (data) => {
        const eventData = new ResponseEventArgs(
          TraderCommandType.None,
          data.toString(),
        );
        if (EnvConfig.ENABLE_DEBUG) {
          this.logger.log(eventData.data);
        }
        const jsonData = eventData.data as JsonData;
        const updatedData = await Promise.all(
          jsonData.POS.map(async (s) => {
            const {
              name,
              market,
              primary_exchange,
              currency_name,
              sic_description,
            } = await this.polygonService.getStockDetails(s.symb);
            return {
              ...s,
              name,
              market,
              primary_exchange,
              currency_name,
              sic_description,
            };
          }),
        );
        set(jsonData, 'POS', updatedData);
        this.emit('trade-data', jsonData);

        const { Order: orders, Trade: trades } = jsonData;
        orders.forEach((o: Order) => {
          // this.logger.verbose(`order-${JSON.stringify(o)}`);
          this.tradeBotService.updateTradeBotOrder(
            o.token,
            o.id,
            TradeStatus[o.status],
          );
          const trade: Partial<TradeOrder> = {
            id: o.id,
            token: o.token,
            symb: o.symb,
            bs: o['b/s'],
            mktLmt: o['mkt/lmt'],
            qty: isNaN(o.qty) ? 0 : Number(o.qty),
            lvqty: isNaN(o.lvqty) ? 0 : Number(o.lvqty),
            cxlqty: isNaN(o.cxlqty) ? 0 : Number(o.cxlqty),
            price: isNaN(o.price) ? 0 : Number(o.price),
            route: o.route,
            status: o.status,
            time: o.time,
            type: TradeType.ORDER,
            // createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          this.tradeBotService.upsertBotOrder(trade as TradeOrder);
        });
        trades.forEach((t: Trade) => {
          // this.logger.verbose(`trade-${JSON.stringify(t)}`);
          const trade: Partial<TradeOrder> = {
            id: t.id,
            token: t.orderid.toFixed(),
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
            // createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          this.tradeBotService.upsertBotOrder(trade as TradeOrder);
        });
      });
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
}
