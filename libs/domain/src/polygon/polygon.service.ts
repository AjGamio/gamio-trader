// src/polygon-api/polygon-api.service.ts

import axios from 'axios';
import { Model } from 'mongoose';

import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { EnvConfig } from '../config/env.config';
import {
  calculateAverage,
  calculateAverageWithMinMax,
} from '../das/common/trade.helper';
import {
  iTickerAverages,
  ITickerData,
  TickerAggregateDetailV2,
  TickerDetailV3,
  TickerIndicatorDetailV1,
} from './interfaces/iTickerData';
import { Stock } from './stock.entity';
import { Quote } from '../das/interfaces/iData';

@Injectable()
export class PolygonApiService {
  private readonly logger: Logger;
  public averages: iTickerAverages;
  private readonly baseUrl = 'https://api.polygon.io'; // Replace with the actual Polygon API base URL
  private readonly apiKey = EnvConfig.POLYGON_API_KEY; // Replace with your actual Polygon API key

  constructor(
    @InjectModel(Stock.name)
    private readonly stockModel: Model<Stock>,
  ) {
    this.logger = new Logger(PolygonApiService.name);
  }

  async getPolygonData(symbol: string): Promise<Stock> {
    const endpoint = `/v3/reference/tickers/${symbol}`; // Replace with the actual endpoint

    if (EnvConfig.ENABLE_DEBUG) {
      this.logger.debug(
        `Fetching detail for symbol- ${symbol}, url: ${endpoint}`,
      );
    }
    try {
      const response = await axios.get(`${this.baseUrl}${endpoint}`, {
        headers: { Authorization: `Bearer ${this.apiKey}` },
      });

      const data = {
        request_id: response.data.request_id,
        ...response.data.results,
      };
      return data;
    } catch (error) {
      // Handle errors
      this.logger.error(
        'Error fetching Polygon data:',
        error.response?.data || error.message,
      );
      return null;
    }
  }

  async getMarketCap(): Promise<ITickerData[]> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/v2/snapshot/locale/us/markets/stocks/tickers?apiKey=${this.apiKey}`,
      );
      const data = response.data;
      // this.prepareTickerMetadata(data.tickers);
      return data.tickers;
    } catch (error) {
      console.error('Error fetching market cap:', error.message);
      return null;
    }
  }

  async getMarketCapForTicker(symbol: string): Promise<TickerDetailV3 | null> {
    try {
      const response = await axios.get<TickerDetailV3>(
        `${this.baseUrl}/v3/reference/tickers/${symbol}?apiKey=${this.apiKey}`,
      );
      const data = response.data;
      return data ?? null;
    } catch (error) {
      console.error(
        `Error fetching market cap for symbol-${symbol}, error: ${error.message}`,
      );
      return null;
    }
  }

  async fetchAggregateBars(
    ticker: string,
    multiplier: number,
    timespan: string,
    from: string,
    to: string,
  ): Promise<TickerAggregateDetailV2 | null> {
    if (multiplier > 0) {
      const url = `${this.baseUrl}/v2/aggs/ticker/${ticker}/range/${multiplier}/${timespan}/${from}/${to}?apiKey=${this.apiKey}`;

      try {
        const response = await axios.get<TickerAggregateDetailV2>(url);

        if (response.status !== 200) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        return response.data;
      } catch (error) {
        console.error(error);
        this.logger.error(
          `Error fetching aggregated bar data for ticker-${ticker}, error: ${error.message}`,
        );
        return null;
      }
    }
  }

  async fetchRSI(ticker: string): Promise<TickerIndicatorDetailV1 | null> {
    const url = `${this.baseUrl}/v1/indicators/rsi/${ticker}?timespan=day&adjusted=true&window=14&series_type=close&order=desc&apiKey=${this.apiKey}`;
    try {
      const response = await axios.get<TickerIndicatorDetailV1>(url);

      if (response.status !== 200) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return response.data;
    } catch (error) {
      console.error(
        `Error fetching RSI indicator data for ticker-${ticker}, error: ${error.message}`,
      );
      return null;
    }
  }

  private prepareTickerMetadata(tickerData: ITickerData[]) {
    this.averages = {
      today: {
        change: calculateAverageWithMinMax(tickerData, 'todaysChange'),
        percentage: calculateAverageWithMinMax(tickerData, 'todaysChangePerc'),
      },
      volume: {
        today: calculateAverageWithMinMax(tickerData, 'day.v'),
        prevDay: calculateAverageWithMinMax(tickerData, 'prevDay.v'),
        min: calculateAverage(tickerData, 'min.v'),
      },
      weightedVolume: {
        today: calculateAverageWithMinMax(tickerData, 'day.vw'),
        prevDay: calculateAverageWithMinMax(tickerData, 'prevDay.vw'),
        min: calculateAverage(tickerData, 'min.vw'),
      },
      price: {
        today: calculateAverageWithMinMax(tickerData, 'day.c'),
        prevDay: calculateAverageWithMinMax(tickerData, 'prevDay.c'),
        min: calculateAverage(tickerData, 'min.c'),
      },
    };
  }

  async getStockDetails(ticker: string): Promise<Stock> {
    if (EnvConfig.ENABLE_DEBUG) {
      this.logger.debug(`Getting details for stock -${ticker}`);
    }
    const tickerDetails = await this.stockModel.findOne({
      ticker,
    });

    if (!tickerDetails) {
      // Fetch details from Polygon service
      const fetchedTickerDetails = await this.getPolygonData(ticker);

      if (fetchedTickerDetails) {
        // Insert the fetched details into the database
        fetchedTickerDetails.createdAt = new Date().toISOString();
        fetchedTickerDetails.updatedAt = new Date().toISOString();
        const result = await this.stockModel.findOneAndUpdate(
          { ticker },
          fetchedTickerDetails,
          { upsert: true, new: true, setDefaultsOnInsert: true },
        );

        if (!result._id) {
          this.logger.warn(
            `Failed to insert new stock - ${fetchedTickerDetails.ticker}`,
          );
        }
      }
      return fetchedTickerDetails;
    } else {
      if (EnvConfig.ENABLE_DEBUG) {
        // Log a message indicating that the stock was found in the database
        this.logger.log(
          `Stock already exists in the database - ${tickerDetails.ticker}`,
        );
      }
    }
    return tickerDetails;
  }

  /**
   * Fetches the current price of a given symbol from the Polygon API.
   * @param {string} symbol - The symbol to fetch the current price for.
   * @returns {Promise<{ currentPrice: number; askPrice: number; bidPrice: number }>} A promise that resolves with the current prices.
   */
  async getCurrentPrices(
    symbol: string,
  ): Promise<{ currentPrice: number; askPrice: number; bidPrice: number }> {
    const result = { currentPrice: 0, bidPrice: 0, askPrice: 0 };
    try {
      const endpoint = `/v3/quotes/${symbol}?order=desc&limit=10&sort=timestamp`;
      if (EnvConfig.ENABLE_DEBUG) {
        this.logger.debug(endpoint);
      }
      const response = await axios.get(`${this.baseUrl}${endpoint}`, {
        headers: { Authorization: `Bearer ${this.apiKey}` },
      });
      const quotes: Quote[] = response.data.results;
      if (quotes.length > 0) {
        // Get the last quote
        const latestQuote = quotes[0];
        // Calculate the average of bid and ask prices
        return {
          currentPrice: (latestQuote.ask_price + latestQuote.bid_price) / 2,
          bidPrice: latestQuote.bid_price,
          askPrice: latestQuote.ask_price,
        };
      } else {
        console.error(`Failed to get current price for ${symbol}`);
        return result;
      }
    } catch (error) {
      console.error(
        `Error fetching current price for ${symbol}: ${error.message}`,
      );
      return result;
    }
  }
}
