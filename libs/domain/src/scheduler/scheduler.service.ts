import {
  cloneDeep,
  isNil,
} from 'lodash';
import {
  Model,
  Types,
} from 'mongoose';

import {
  Injectable,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  Cron,
  CronExpression,
} from '@nestjs/schedule';

import { EnvConfig } from '../config/env.config';
import { LimitOrderCommand } from '../das/commands/limit.order.command';
import { MarketOrderCommand } from '../das/commands/market.order.command';
import {
  convertTo24HourFormat,
  getCurrentTimeInHHMMFormat,
} from '../das/common/date-time.helper';
import { generateNewOrderToken } from '../das/common/trade.helper';
import { DasService } from '../das/das.service';
import {
  OrderAction,
  TimeInForce,
} from '../das/enums';
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
  }

  // Define a cron job to run every minute
  @Cron(CronExpression.EVERY_10_MINUTES)
  async fetchActiveBots() {
    const startTime = convertTo24HourFormat(getCurrentTimeInHHMMFormat());
    const filteredBots = await this.tradeBotModel
      .find({
        botActiveTimes: {
          $elemMatch: {
            $or: [{ start: { $gte: startTime } }, { end: { $lte: startTime } }],
          },
        },
      })
      .exec();
    this.logger.log('Executing every 10 minutes');
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
    const tickerAverages = this.polygonApiService.averages;
    if (!tickerAverages) {
      this.tickerData = await this.polygonApiService.getMarketCap();
      this.logger.log(`tickerData- ${this.tickerData.length}`);
    }
    this.dasService.emit('tickerAverages', tickerAverages);
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
              numberOfShares,
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

            const params = [];
            if (lowRange > 0 && highRange > 0) {
              if (marketOrLimit === 'MKT') {
                params.push('STOPRANGEMKT');
              } else {
                params.push('STOPRANGE');
              }
              params.push((tickerCurrentPrice - lowRange).toFixed());
              params.push((tickerCurrentPrice + highRange).toFixed());
            }
            const tradeBotOderId = new Types.ObjectId();
            const tradeBotOrder = {
              _id: tradeBotOderId,
              type: TradeType.ORDER,
              bs: longOrShort === 'long' ? BuySellType.BUY : BuySellType.SELL,
              price:
                marketOrLimit === 'LMT'
                  ? longOrShort === 'long'
                    ? tickerMarketCap.min.c + tickerCurrentPrice
                    : tickerMarketCap.min.c - tickerCurrentPrice
                  : 0,
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

            const orderCommand =
              marketOrLimit === 'MKT'
                ? new MarketOrderCommand(
                    tradeBotOrder.token.toString(),
                    tradeBotOrder.bs === BuySellType.BUY
                      ? OrderAction.Buy
                      : OrderAction.Sell,
                    tradeBotOrder.symbol,
                    tradeBotOrder.route,
                    tradeBotOrder.numberOfShares.toFixed(),
                    TimeInForce.DayPlus,
                    ...params,
                  )
                : new LimitOrderCommand(
                    tradeBotOrder.token.toString(),
                    tradeBotOrder.bs === BuySellType.BUY
                      ? OrderAction.Buy
                      : OrderAction.Sell,
                    tradeBotOrder.symbol,
                    tradeBotOrder.route,
                    tradeBotOrder.numberOfShares.toFixed(),
                    tradeBotOrder.price.toFixed(),
                    TimeInForce.DayPlus,
                    ...params,
                  );
            tradeBotOrder.rawCommand = orderCommand.ToString();
            await this.dasService.addBotOrder(
              tradeBotOrder as unknown as TradeBotOrder,
            );
            const rawCommand = `TRADE BOT ORDER COMMAND- ${tradeBotOrder.rawCommand}`;
            this.logger.verbose(rawCommand);
            await this.dasService.sendCommandToServer(orderCommand);
            this.dasService.emit('ticker-info', rawCommand);
          } else {
            const tickerMsg = `No market cap data found for ${tk.ticker}`;
            this.logger.warn(tickerMsg);
            this.dasService.emit('ticker-info', tickerMsg);
          }
        });
      }
    });
    // this.dasService.emit('filteredTickers', this.tradeService.FilteredTickers);
  }

  @Cron(CronExpression.EVERY_10_MINUTES)
  async fetchMarketCap() {
    this.tickerData = await this.polygonApiService.getMarketCap();
    this.logger.log(`tickerData- ${this.tickerData.length}`);
    this.dasService.emit('tickerAverages', this.polygonApiService.averages);
  }
}
