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
          percentChangePreviousClose: Number(
            parameters.percentChangePreviousClose,
          ),
          minPrice: Number(parameters.minPrice),
          maxPrice: Number(parameters.maxPrice),
          dailyVolume: Number(parameters.dailyVolume),
          minMarketCap: Number(parameters.minMarketCap),
          maxMarketCap: Number(parameters.maxMarketCap),
          rsi: Number(parameters.dailyRSI),
          volumeFilters: [
            {
              minutes: Number(
                parameters.percentVolumeChangeLastXMinutesInterval,
              ),
              percentChange: Number(parameters.percentVolumeChangeLastXMinutes),
            },
          ],
          priceFilters: [
            {
              minutes: Number(
                parameters.percentPriceChangeLastXMinutesInterval,
              ),
              percentChange: Number(parameters.percentPriceChangeLastXMinutes),
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
        filteredTickers.slice(0, EnvConfig.TICKER_ORDER_QUEUE_LIMIT),
      );

      filteredTickers = await this.filterByPriceAndVolumeChangeXMinutes(
        criteria,
        filteredTickers.slice(0, EnvConfig.TICKER_ORDER_QUEUE_LIMIT),
      );

      filteredTickers = await this.filterByRSI(
        criteria,
        filteredTickers.slice(0, EnvConfig.TICKER_ORDER_QUEUE_LIMIT),
      );

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

  /**
   * Filter tickers based on given criteria.
   * @param {Criteria} criteria - Filtering criteria object.
   * @param {ITickerData[]} tickers - Array of ticker data to filter.
   * @returns {Promise<ITickerData[]>} - Filtered array of ticker data.
   */
  /**
   * Filter tickers based on given criteria.
   * @param {Criteria} criteria - Filtering criteria object.
   * @param {ITickerData[]} tickers - Array of ticker data to filter.
   * @returns {Promise<ITickerData[]>} - Filtered array of ticker data.
   */
  private async filterTickers(
    criteria: Criteria,
    tickers: ITickerData[],
  ): Promise<ITickerData[]> {
    const filteredTickers = tickers.filter((ticker: ITickerData) => {
      const { todaysChangePerc } = ticker;
      const { c: price, v: volume } = ticker.min || {};
      const { percentChangePreviousClose, minPrice, maxPrice, dailyVolume } =
        criteria;
      const tickersData = [];
      if (Number(percentChangePreviousClose) > 0) {
        if (Number(todaysChangePerc) >= Number(percentChangePreviousClose)) {
          tickersData.push(ticker);
        }
      }
      if (Number(minPrice) > 0) {
        if (Number(price) >= Number(minPrice)) {
          tickersData.push(ticker);
        }
      }
      if (Number(maxPrice) > 0) {
        if (Number(price) <= Number(maxPrice)) {
          tickersData.push(ticker);
        }
      }
      if (Number(dailyVolume) > 0) {
        if (Number(volume) >= Number(dailyVolume)) {
          tickersData.push(ticker);
        }
      }
      // Filtering logic based on criteria
      return tickersData;
    });

    return filteredTickers.slice(0, EnvConfig.TICKER_ORDER_QUEUE_LIMIT);
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

  /**
   * Filter tickers by market capitalization based on given criteria.
   * @param {Criteria} criteria - Filtering criteria object.
   * @param {ITickerData[]} tickers - Array of ticker data to filter.
   * @param {number} delay - Delay in milliseconds between each fetch call (default: 1000ms).
   * @returns {Promise<ITickerData[]>} - Filtered array of ticker data.
   */
  private async filterTickersByMarketCap(
    criteria: Criteria,
    tickers: ITickerData[],
  ): Promise<ITickerData[]> {
    const filteredTickers: ITickerData[] = [];
    const processedTickers: string[] = [];
    if (EnvConfig.ENABLE_DEBUG) {
      this.logger.verbose(
        `Fetching market caps data for ${tickers.length} ticker symbols`,
      );
    }
    for (let i = 0; i < tickers.length; i++) {
      const ticker = tickers[i];
      if (EnvConfig.ENABLE_DEBUG) {
        this.logger.verbose(
          `Fetching market cap data for [${i + 1}] ${ticker.ticker}`,
        );
      }

      const tickerIndex = processedTickers.findIndex(
        (t) => t === ticker.ticker,
      );
      if (tickerIndex === -1) {
        // Fetch market capitalization for the ticker
        const tickerDetail = await this.fetchMarketCapForTicker(ticker);

        const { minMarketCap, maxMarketCap } = criteria;

        // Check if ticker's market cap meets the criteria
        if (
          (Number(tickerDetail?.results?.market_cap) && Number(minMarketCap) > 0
            ? Number(tickerDetail?.results?.market_cap) >= Number(minMarketCap)
            : true) &&
          (Number(tickerDetail?.results?.market_cap) && Number(maxMarketCap) > 0
            ? Number(tickerDetail?.results?.market_cap) <= Number(maxMarketCap)
            : true)
        ) {
          // If criteria is met, set the marketCap property on the ticker
          set(ticker, 'marketCap', tickerDetail?.results?.market_cap);
          filteredTickers.push(ticker); // Add the ticker with added marketCap property to the filtered list
        }
        processedTickers.push(ticker.ticker);
      }
    }

    return filteredTickers;
  }

  /**
   * Filters tickers based on price and volume change over specified minutes.
   * @param {Criteria} criteria - Filtering criteria object.
   * @param {ITickerData[]} tickers - Array of ticker data to filter.
   * @returns {Promise<ITickerData[]>} - Filtered array of ticker data.
   */
  private async filterByPriceAndVolumeChangeXMinutes(
    criteria: Criteria,
    tickers: ITickerData[],
  ): Promise<ITickerData[]> {
    const currentDate = new Date().toISOString().split('T')[0];
    const filteredTickers: ITickerData[] = [];

    // Iterate over each ticker asynchronously
    for (const ticker of tickers) {
      let isValidTicker = true;

      // Apply volume filters if necessary
      if (
        criteria.volumeFilters.some((volumeFilter) => volumeFilter.minutes > 0)
      ) {
        for (const volumeFilter of criteria.volumeFilters) {
          if (volumeFilter.minutes <= 0) {
            continue; // Skip this volume filter if minutes is 0 or negative
          }

          const volumeBars = await this.polygonService.fetchAggregateBars(
            ticker.ticker,
            volumeFilter.minutes,
            'minute',
            currentDate,
            currentDate,
          );

          // Check if volumeBars have valid status and results
          if (volumeBars?.status && volumeBars?.results) {
            const volumeAggregates = volumeBars.results.map((bar) => bar.v);
            const volumeChangeLastXMinutes = calculateVolumeChange(
              volumeAggregates.slice(-volumeFilter.minutes),
            );

            // Check volume change against percent change filter
            if (volumeChangeLastXMinutes < volumeFilter.percentChange) {
              isValidTicker = false;
              break; // Exit volumeFilter loop if condition fails
            }

            // Assign volume change to ticker object
            ticker[`volumeChangeLast${volumeFilter.minutes}Minutes`] =
              volumeChangeLastXMinutes;
          }
        }
      }

      // Apply price filters if necessary
      if (
        criteria.priceFilters.some((priceFilter) => priceFilter.minutes > 0)
      ) {
        for (const priceFilter of criteria.priceFilters) {
          if (priceFilter.minutes <= 0) {
            continue; // Skip this price filter if minutes is 0 or negative
          }

          const priceBars = await this.polygonService.fetchAggregateBars(
            ticker.ticker,
            priceFilter.minutes,
            'minute',
            currentDate,
            currentDate,
          );

          // Check if priceBars have valid status and results
          if (priceBars?.status && priceBars?.results) {
            const priceAggregates = priceBars.results.map((bar) => bar.c);
            const priceChangeLastXMinutes = calculatePriceChange(
              priceAggregates.slice(-priceFilter.minutes),
            );

            // Check price change against percent change filter
            if (priceChangeLastXMinutes < priceFilter.percentChange) {
              isValidTicker = false;
              break; // Exit priceFilter loop if condition fails
            }

            // Assign price change to ticker object
            ticker[`priceChangeLast${priceFilter.minutes}Minutes`] =
              priceChangeLastXMinutes;
          }
        }
      }

      // Add ticker to filteredTickers if it's valid
      if (isValidTicker) {
        filteredTickers.push(ticker);
      }
    }

    return filteredTickers;
  }

  /**
   * Filters tickers based on Relative Strength Index (RSI) criteria.
   * @param {Criteria} criteria - Filtering criteria object.
   * @param {ITickerData[]} tickers - Array of ticker data to filter.
   * @returns {Promise<ITickerData[]>} - Filtered array of ticker data.
   */
  private async filterByRSI(
    criteria: Criteria,
    tickers: ITickerData[],
  ): Promise<ITickerData[]> {
    const filteredTickers: ITickerData[] = [];

    // Iterate over each ticker asynchronously
    for (const ticker of tickers) {
      // Check if criteria.rsi is defined and valid
      if (criteria.rsi && !isNaN(criteria.rsi)) {
        const rsi = await this.polygonService.fetchRSI(ticker.ticker);

        // Check if rsi data is valid and meets criteria
        if (
          rsi?.results?.values?.length > 0 &&
          rsi?.results?.values[0]?.value <= criteria.rsi
        ) {
          set(ticker, 'rsi', rsi.results.values[0]?.value);
          filteredTickers.push(ticker);
        }
      } else {
        // If criteria.rsi is not defined or not valid, include the ticker without RSI filtering
        filteredTickers.push(ticker);
      }
    }

    return filteredTickers;
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
