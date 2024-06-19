import { Injectable, Logger } from '@nestjs/common';
import {
  Criteria,
  ITickerData,
  TickerDetailV3,
} from 'gamio/domain/polygon/interfaces/iTickerData';
import { ITradeBot } from 'gamio/domain/trade-bot/itradeBot';
import { set } from 'lodash';
import { PolygonApiService } from '../polygon/polygon.service';
import {
  calculatePriceChange,
  calculateVolumeChange,
} from '../das/common/trade.helper';
import { FilteredTickersData } from '../das/interfaces/iData';
import { EnvConfig } from '../config/env.config';

@Injectable()
export class TradeService {
  private readonly logger: Logger;
  public FilteredTickers: FilteredTickersData[] = [];

  constructor(private polygonService: PolygonApiService) {
    this.logger = new Logger(TradeService.name);
  }

  public async startScanner(bots: ITradeBot[], tickers: ITickerData[]) {
    bots.forEach((bot: ITradeBot) => {
      if (bot.strategies?.parameters) {
        const parameters = bot.strategies.parameters;
        const convertedStrategies = {
          percentChangePreviousClose: parameters.percentChangePreviousClose,
          minPrice: parameters.minPrice,
          maxPrice: parameters.maxPrice,
          dailyVolume: parameters.dailyVolume,
          minMarketCap: parameters.minMarketCap,
          maxMarketCap: parameters.maxMarketCap,
          rsi: parameters.dailyRSI,
          volumeFilters: [
            {
              minutes: parameters.percentVolumeChangeLastXMinutesInterval,
              percentChange: parameters.percentVolumeChangeLastXMinutes,
            },
          ],
          priceFilters: [
            {
              minutes: parameters.percentPriceChangeLastXMinutesInterval,
              percentChange: parameters.percentPriceChangeLastXMinutes,
            },
          ],
        };
        this.runFilter(
          { botId: bot._id.$oid, botName: bot.name, ...convertedStrategies },
          tickers,
          bot,
        );
      }
    });
  }

  private async runFilter(
    criteria: Criteria,
    tickers: ITickerData[],
    bot: ITradeBot,
  ) {
    if (tickers && tickers.length > 0) {
      let filteredTickers = await this.filterTickers(criteria, tickers);

      filteredTickers = await this.filterTickersByMarketCap(
        criteria,
        filteredTickers,
      );

      filteredTickers = await this.filterByPriceAndVolumeChangeXMinutes(
        criteria,
        filteredTickers,
      );

      filteredTickers = await this.filterByRSI(criteria, filteredTickers);

      this.FilteredTickers.push({
        tickers: filteredTickers,
        bot,
        status: filteredTickers.length > 0 ? 'waiting' : 'empty',
      });

      const existingEntryIndex = this.FilteredTickers.findIndex(
        (entry) =>
          entry.bot.name === bot.name && entry.bot._id.$oid === bot._id.$oid,
      );

      if (existingEntryIndex !== -1) {
        // Entry with the same bot and tickers already exists, update it
        this.FilteredTickers[existingEntryIndex].status =
          filteredTickers.length > 0 ? 'waiting' : 'empty';
      } else {
        // Entry doesn't exist, add a new one
        this.FilteredTickers.push({
          tickers: filteredTickers,
          bot,
          status: filteredTickers.length > 0 ? 'waiting' : 'empty',
        });
      }
      if (EnvConfig.ENABLE_DEBUG && filteredTickers.length > 0) {
        this.logger.verbose(
          this.FilteredTickers.map((t) => {
            return {
              bot: t.bot.name,
              tickers: t.tickers.map((s) => ({
                symbol: s.ticker,
                price: s.min.c,
              })),
            };
          }),
        );
      }
    }
  }

  private async filterTickers(criteria: Criteria, tickers: ITickerData[]) {
    return tickers.filter((ticker: ITickerData) => {
      const { todaysChangePerc } = ticker;
      const { c: price, v: dailyVolume } = ticker.min || {};

      return (
        todaysChangePerc >= criteria.percentChangePreviousClose &&
        (price
          ? price >= criteria.minPrice && price <= criteria.maxPrice
          : false) &&
        (dailyVolume ? dailyVolume >= criteria.dailyVolume : false)
      );
    });
  }

  private async fetchMarketCapForTicker(
    ticker: ITickerData,
  ): Promise<TickerDetailV3> {
    return await this.polygonService.getMarketCapForTicker(ticker.ticker);
  }

  private shouldIncludeTicker(
    ticker: ITickerData,
    criteria: Criteria,
    marketCap: ITickerData,
  ): boolean {
    return (
      marketCap !== null &&
      marketCap.min.c >= criteria.minMarketCap &&
      marketCap.min.c <= criteria.maxMarketCap
    );
  }

  private async filterTickersByMarketCap(
    criteria: Criteria,
    tickers: ITickerData[],
  ) {
    const filteredTickers = await Promise.all(
      tickers.map(async (ticker) => {
        const tickerDetail = await this.fetchMarketCapForTicker(ticker);

        if (
          tickerDetail &&
          tickerDetail.results &&
          tickerDetail.results.market_cap >= criteria.minMarketCap &&
          tickerDetail.results.market_cap <= criteria.maxMarketCap
        ) {
          set(ticker, 'marketCap', tickerDetail.results.market_cap);
          return ticker;
        }

        return null;
      }),
    );

    return filteredTickers.filter((ticker) => ticker !== null);
  }

  private async filterByPriceAndVolumeChangeXMinutes(
    criteria: Criteria,
    tickers: ITickerData[],
  ) {
    const filteredTickers = await Promise.all(
      tickers.map(async (ticker) => {
        const currentDate = new Date().toISOString().split('T')[0];
        let isValidTicker = true;
        for (const volumeFilter of criteria.volumeFilters) {
          const volumeBars = await this.polygonService.fetchAggregateBars(
            ticker.ticker,
            volumeFilter.minutes,
            'minute',
            currentDate,
            currentDate,
          );
          if (volumeBars && volumeBars.status && volumeBars.results) {
            const volumeAggregates = volumeBars.results.map((bar) => bar.v);
            const volumeChangeLastXMinutes = calculateVolumeChange(
              volumeAggregates.slice(-volumeFilter.minutes),
            );
            if (volumeChangeLastXMinutes < volumeFilter.percentChange) {
              isValidTicker = false;
              break;
            }
            ticker[`volumeChangeLast${volumeFilter.minutes}Minutes`] =
              volumeChangeLastXMinutes;
          }

          if (isValidTicker) {
            for (const priceFilter of criteria.priceFilters) {
              const priceBars = await this.polygonService.fetchAggregateBars(
                ticker.ticker,
                priceFilter.minutes,
                'minute',
                currentDate,
                currentDate,
              );
              if (priceBars && priceBars.status && priceBars.results) {
                const priceAggregates = priceBars.results.map((bar) => bar.c);
                const priceChangeLastXMinutes = calculatePriceChange(
                  priceAggregates.slice(-priceFilter.minutes),
                );
                if (priceChangeLastXMinutes < priceFilter.percentChange) {
                  isValidTicker = false;
                  break;
                }
                ticker[`priceChangeLast${priceFilter.minutes}Minutes`] =
                  priceChangeLastXMinutes;
              }
            }
          }
        }
        return isValidTicker ? ticker : null;
      }),
    );

    return filteredTickers.filter((ticker) => ticker !== null);
  }

  private async filterByRSI(criteria: Criteria, tickers: ITickerData[]) {
    const filteredTickers = await Promise.all(
      tickers.map(async (ticker) => {
        const rsi = await this.polygonService.fetchRSI(ticker.ticker); // this works
        if (
          rsi &&
          rsi.status &&
          rsi.results.values?.length > 0 &&
          rsi.results.values[0]?.value <= criteria.rsi
        ) {
          set(ticker, 'rsi', rsi.results.values[0]?.value);
          return ticker;
        }
        return null;
      }),
    );
    return filteredTickers.filter((ticker) => ticker !== null);
  }

  // Function to compare arrays for equality
  private arraysEqual(arr1: any[], arr2: any[]): boolean {
    if (arr1.length !== arr2.length) return false;
    for (let i = 0; i < arr1.length; i++) {
      if (arr1[i] !== arr2[i]) return false;
    }
    return true;
  }
}
