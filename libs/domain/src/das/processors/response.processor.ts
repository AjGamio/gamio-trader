import { Socket } from 'net';
import { EventEmitter } from 'stream';
import { Logger } from '@nestjs/common';
import { ResponseEventArgs } from './response.event.args';
import { GenericEventEmitter } from './event.processor';
import { TraderCommandType } from '../enums';
import { EnvConfig } from 'apps/trade-server/src/config/env.config';
import { CommandData, JsonData, Order, Trade } from '../interfaces/iData';
import { TradeBotsService } from 'gamio/domain/trade-bot/tradebot.service';
import {
  TradeStatus,
  TradeType,
} from 'gamio/domain/trade-bot/tradeBotOder.entity';
import { TradeOrder } from 'gamio/domain/trade-bot/tradeOrder.entity';

class ResponseProcessor extends EventEmitter {
  private readonly logger: Logger;
  public readonly LoginResponse: GenericEventEmitter<
    ResponseEventArgs,
    TraderCommandType.LOGIN_COMMAND
  > = new EventEmitter();
  public readonly LogoutResponse: GenericEventEmitter<
    ResponseEventArgs,
    TraderCommandType.QUIT_COMMAND
  > = new EventEmitter();
  public readonly ClientResponse: GenericEventEmitter<
    ResponseEventArgs,
    TraderCommandType.CLIENT_COMMAND
  > = new EventEmitter();
  public readonly EchoResponse: GenericEventEmitter<
    ResponseEventArgs,
    TraderCommandType.ECHO_COMMAND
  > = new EventEmitter();
  public readonly BuyingPowerResponse: GenericEventEmitter<
    ResponseEventArgs,
    TraderCommandType.GET_BUYING_POWER_COMMAND
  > = new EventEmitter();

  public readonly NewOrderResponse: GenericEventEmitter<
    ResponseEventArgs,
    TraderCommandType.NEWORDER_COMMAND
  > = new EventEmitter();

  constructor(private readonly tradeBotService: TradeBotsService) {
    super();
    this.logger = new Logger(this.constructor.name);
  }

  async listenAsync(
    stream: Socket,
    commandType: TraderCommandType,
  ): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const onData = (data: Buffer) => {
        const receivedData = data.toString();
        if (EnvConfig.ENABLE_DEBUG) {
          this.logger.log(
            `commandType: ${commandType}, receivedData:${receivedData}`,
          );
        }

        // Emit events based on command type
        this.emitEvent(
          commandType,
          new ResponseEventArgs(commandType, receivedData),
        );
      };

      const onError = (err: Error) => {
        console.error('Error:', err.message);
        if (err.message === 'Not Login') {
          // Emit events based on command type
          this.emitEvent(
            commandType,
            new ResponseEventArgs(commandType, err.message),
          );
        }
        reject(err);
        this.stopListening();
      };

      const onClose = () => {
        console.log('Connection closed');
        this.stopListening();
        resolve();
      };

      // Attach event listeners
      stream.on('data', onData);
      stream.on('error', onError);
      stream.on('close', onClose);
    });
  }

  private emitEvent(commandType: TraderCommandType, data: ResponseEventArgs) {
    const formattedData: CommandData = {
      commandType: commandType,
      dataId: data.correlationId,
      data: data.data,
    };

    const { Order: orders, Trade: trades } = data.data as JsonData;
    orders.forEach((o: Order) => {
      this.logger.verbose(`order-${JSON.stringify(o)}`);
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
      this.logger.verbose(`trade-${JSON.stringify(t)}`);
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

    // this.logger.log(formattedData);
    // this.logger.verbose(`Emitting data for command:${data.commandType}`);
    this.emit(commandType.toString(), formattedData);
  }

  private stopListening() {
    // Implement cleanup logic or additional actions when stopping listening
    this.logger.verbose('Stopping listening');
  }
}

export { ResponseProcessor };
