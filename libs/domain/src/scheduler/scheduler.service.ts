import { cloneDeep, isNil } from 'lodash';
import { Model, Types } from 'mongoose';

import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Cron } from '@nestjs/schedule';

import { EnvConfig } from '../config/env.config';
import { LimitOrderCommand } from '../das/commands/limit.order.command';
import { MarketOrderCommand } from '../das/commands/market.order.command';
import {
  convertTo24HourFormat,
  getCurrentTimeInHHMMFormat,
} from '../das/common/date-time.helper';
import { generateNewOrderToken } from '../das/common/trade.helper';
import { DasService } from '../das/das.service';
import { OrderAction, TimeInForce } from '../das/enums';
import { FilteredTickersData } from '../das/interfaces/iData';
import { ITickerData } from '../polygon/interfaces/iTickerData';
import { PolygonApiService } from '../polygon/polygon.service';
import { TradeBot } from '../trade-bot/tradeBot.entity';
import {
  BuySellType,
  TradeBotOrder,
  TradeStatus,
  TradeType,
} from '../trade-bot/tradeBotOder.entity';
import { TradeService } from '../trade/trade.service';
import { StopRangeOrderCommand } from '../das/commands/stop.range.order.command';

@Injectable()
export class SchedulerService {
  public tickerData: ITickerData[] = [];
  private readonly logger: Logger;
  constructor(
    @InjectModel(TradeBot.name) private readonly tradeBotModel: Model<TradeBot>,
    private readonly polygonApiService: PolygonApiService,
    private readonly tradeService: TradeService,
    private readonly dasService: DasService,
  ) {
    this.logger = new Logger(SchedulerService.name);
    this.logger.debug('EnvConfig.SCHEDULER.CRON', EnvConfig.SCHEDULER.CRON);
  }

  // Define a cron job to run every minute
  @Cron(EnvConfig.SCHEDULER.CRON.BOT_TRADE)
  async fetchActiveBots() {
    const startTime = convertTo24HourFormat(getCurrentTimeInHHMMFormat());
    const filteredBots = await this.tradeBotModel
      .find({
        botActiveTimes: {
          $elemMatch: {
            $or: [{ start: { $lte: startTime } }, { end: { $gte: startTime } }],
          },
        },
      })
      .exec();
    if (filteredBots.length > 0) {
      this.logger.log(
        `filteredBots-${filteredBots.map((b) => b.name).join(' | ')}`,
      );
    }
    if (this.dasService.client) {
      this.dasService.client.emit('ping', 'Executing every 10 minutes');
      this.dasService.client.emit(
        'filteredBots',
        filteredBots.map((b) => b.name),
      );
    }

    this.tickerData = await this.polygonApiService.getMarketCap();
    this.logger.log(`tickerData- ${this.tickerData.length}`);
    await this.tradeService.startScanner(filteredBots, this.tickerData);
    const filteredTickers = cloneDeep(this.tradeService.FilteredTickers);
    filteredTickers?.map((t: FilteredTickersData) => {
      if (t.status === 'waiting') {
        t.processingDateTime = { start: new Date(), finish: new Date() };
        const tickerMsg = `Processing filtered tickers data for bot- ${t.bot.name} [${t.bot._id}] at - ${t.processingDateTime.start}`;
        this.logger.verbose(tickerMsg);
        this.dasService.emit('ticker-info', tickerMsg);
        const limit = EnvConfig.TICKER_ORDER_QUEUE_LIMIT;
        const queuedTickers = t.tickers.slice(0, limit);
        const tickerOrderMsg = `Creating new orders for ${queuedTickers.map(
          (t) => t.ticker,
        )} tickers`;
        this.logger.log(tickerOrderMsg);
        this.dasService.emit('ticker-info', tickerOrderMsg);
        queuedTickers?.map(async (tk: ITickerData) => {
          const tickerMarketCap = this.tickerData?.find((td: ITickerData) => {
            return td.ticker === tk.ticker;
          });
          if (!isNil(tickerMarketCap)) {
            const { orders } = t.bot.strategies;
            const {
              totalSharePrice,
              stopLossPercent,
              takeProfitPercent,
              timeLimitStop,
              longOrShort,
              marketOrLimit,
              limitOrderPercent,
            } = orders;
            const tickerCurrentPrice = parseFloat(
              (tickerMarketCap.min.c * limitOrderPercent).toFixed(2),
            );
            const highRange = parseFloat(
              (tickerMarketCap.min.c * takeProfitPercent).toFixed(2),
            );
            const lowRange = parseFloat(
              (tickerMarketCap.min.c * stopLossPercent).toFixed(2),
            );

            const tradeBotOderId = new Types.ObjectId();
            const isLimitOrder = marketOrLimit === 'LMT';
            const isLongPosition = longOrShort === 'long';

            const perSharePrice = isLimitOrder
              ? isLongPosition
                ? tickerMarketCap.min.c + tickerCurrentPrice
                : tickerMarketCap.min.c - tickerCurrentPrice
              : 0;

            if (perSharePrice > 0) {
              const numberOfShares = Math.floor(
                Number(totalSharePrice) / Number(perSharePrice),
              );
              if (numberOfShares > 0) {
                const tradeBotOrder = {
                  _id: tradeBotOderId,
                  type: TradeType.ORDER,
                  bs:
                    longOrShort === 'long' ? BuySellType.BUY : BuySellType.SELL,
                  price: perSharePrice,
                  symbol: tickerMarketCap.ticker,
                  route: 'SMAT',
                  numberOfShares,
                  stopLossPercent,
                  takeProfitPercent,
                  timeLimitStop,
                  timeOfTrade: '',
                  tradeNumber: '',
                  botId: new Types.ObjectId(t.bot._id.$oid),
                  botName: t.bot.name,
                  createdAt: new Date(),
                  updatedAt: new Date(),
                  status: TradeStatus.PENDING,
                  message: '',
                  rawCommand: '',
                  token: generateNewOrderToken().toString(),
                };

                const orderCommand = this.createOrderCommand(
                  lowRange,
                  highRange,
                  tradeBotOrder,
                  marketOrLimit,
                  tickerCurrentPrice,
                );
                tradeBotOrder.rawCommand = orderCommand.ToString();
                await this.dasService.addBotOrder(
                  tradeBotOrder as unknown as TradeBotOrder,
                );
                const rawCommand = `TRADE BOT ORDER COMMAND- ${tradeBotOrder.rawCommand}`;
                this.logger.verbose(rawCommand);
                await this.dasService.sendCommandToServer(orderCommand);
                this.dasService.emit('ticker-info', rawCommand);
              }
            }
          } else {
            const tickerMsg = `No market cap data found for ${tk.ticker}`;
            this.logger.warn(tickerMsg);
            this.dasService.emit('ticker-info', tickerMsg);
          }
        });
      }
    });
    this.logger.log(`Last scheduler run for bot trades: ${new Date()}`);
    // this.dasService.emit('filteredTickers', this.tradeService.FilteredTickers);
  }

  @Cron(EnvConfig.SCHEDULER.CRON.DATA_REFRESH)
  async posRefresh() {
    this.dasService.posRefresh();
    this.logger.log(`Last scheduler run for data refresh: ${new Date()}`);
  }

  private createOrderCommand(
    lowRange: number,
    highRange: number,
    tradeBotOrder: {
      _id: Types.ObjectId;
      type: TradeType;
      bs: BuySellType;
      price: number;
      symbol: string;
      route: string;
      numberOfShares: number;
      stopLossPercent: number;
      takeProfitPercent: number;
      timeLimitStop: number;
      timeOfTrade: string;
      tradeNumber: string;
      botId: Types.ObjectId;
      botName: string;
      createdAt: Date;
      updatedAt: Date;
      status: TradeStatus;
      message: string;
      rawCommand: string;
      token: string;
    },
    marketOrLimit: string,
    tickerCurrentPrice: number,
  ) {
    this.logger.debug({ lowRange, highRange });
    return lowRange > 0 && highRange > 0
      ? new StopRangeOrderCommand(
          tradeBotOrder.token.toString(),
          this.setOrderAction(tradeBotOrder),
          tradeBotOrder.symbol,
          tradeBotOrder.route,
          tradeBotOrder.numberOfShares.toFixed(),
          marketOrLimit === 'MKT',
          (tickerCurrentPrice - lowRange).toFixed(),
          (tickerCurrentPrice + highRange).toFixed(),
        )
      : this.createMarketOrLimitOrder(marketOrLimit, tradeBotOrder);
  }

  private setOrderAction(tradeBotOrder: {
    _id: Types.ObjectId;
    type: TradeType;
    bs: BuySellType;
    price: number;
    symbol: string;
    route: string;
    numberOfShares: number;
    stopLossPercent: number;
    takeProfitPercent: number;
    timeLimitStop: number;
    timeOfTrade: string;
    tradeNumber: string;
    botId: Types.ObjectId;
    botName: string;
    createdAt: Date;
    updatedAt: Date;
    status: TradeStatus;
    message: string;
    rawCommand: string;
    token: string;
  }): OrderAction {
    return tradeBotOrder.bs === BuySellType.BUY
      ? OrderAction.Buy
      : OrderAction.Sell;
  }

  private createMarketOrLimitOrder(
    marketOrLimit: string,
    tradeBotOrder: {
      _id: Types.ObjectId;
      type: TradeType;
      bs: BuySellType;
      price: number;
      symbol: string;
      route: string;
      numberOfShares: number;
      stopLossPercent: number;
      takeProfitPercent: number;
      timeLimitStop: number;
      timeOfTrade: string;
      tradeNumber: string;
      botId: Types.ObjectId;
      botName: string;
      createdAt: Date;
      updatedAt: Date;
      status: TradeStatus;
      message: string;
      rawCommand: string;
      token: string;
    },
  ) {
    return marketOrLimit === 'MKT'
      ? this.createMarketOrder(tradeBotOrder)
      : this.createLimitOrder(tradeBotOrder);
  }

  private createLimitOrder(tradeBotOrder: {
    _id: Types.ObjectId;
    type: TradeType;
    bs: BuySellType;
    price: number;
    symbol: string;
    route: string;
    numberOfShares: number;
    stopLossPercent: number;
    takeProfitPercent: number;
    timeLimitStop: number;
    timeOfTrade: string;
    tradeNumber: string;
    botId: Types.ObjectId;
    botName: string;
    createdAt: Date;
    updatedAt: Date;
    status: TradeStatus;
    message: string;
    rawCommand: string;
    token: string;
  }) {
    return new LimitOrderCommand(
      tradeBotOrder.token.toString(),
      this.setOrderAction(tradeBotOrder),
      tradeBotOrder.symbol,
      tradeBotOrder.route,
      tradeBotOrder.numberOfShares.toFixed(),
      tradeBotOrder.price.toFixed(),
      TimeInForce.DayPlus,
    );
  }

  private createMarketOrder(tradeBotOrder: {
    _id: Types.ObjectId;
    type: TradeType;
    bs: BuySellType;
    price: number;
    symbol: string;
    route: string;
    numberOfShares: number;
    stopLossPercent: number;
    takeProfitPercent: number;
    timeLimitStop: number;
    timeOfTrade: string;
    tradeNumber: string;
    botId: Types.ObjectId;
    botName: string;
    createdAt: Date;
    updatedAt: Date;
    status: TradeStatus;
    message: string;
    rawCommand: string;
    token: string;
  }) {
    return new MarketOrderCommand(
      tradeBotOrder.token.toString(),
      this.setOrderAction(tradeBotOrder),
      tradeBotOrder.symbol,
      tradeBotOrder.route,
      tradeBotOrder.numberOfShares.toFixed(),
      TimeInForce.DayPlus,
    );
  }

  @Cron(EnvConfig.SCHEDULER.CRON.MARKET_CAP)
  async fetchMarketCap() {
    this.tickerData = await this.polygonApiService.getMarketCap();
    this.logger.log(`tickerData- ${this.tickerData.length}`);
    this.logger.log(`Last scheduler run for market caps: ${new Date()}`);
    // this.dasService.emit('tickerAverages', this.polygonApiService.averages);
  }
}
