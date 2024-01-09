// src/polygon-api/polygon-api.service.ts

import { Injectable, Logger } from '@nestjs/common';
import { EnvConfig } from '../config/env.config';
import axios from 'axios';
import {
  ITickerData,
  TickerAggregateDetailV2,
  TickerDetailV3,
  TickerIndicatorDetailV1,
  iTickerAverages,
} from './interfaces/iTickerData';
import {
  calculateAverage,
  calculateAverageWithMinMax,
} from '../das/common/trade.helper';
import { Stock } from './stock.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

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
      console.error(
        'Error fetching Polygon data:',
        error.response?.data || error.message,
      );
      throw error;
    }
  }

  async getMarketCap(): Promise<ITickerData[]> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/v2/snapshot/locale/us/markets/stocks/tickers?apiKey=${this.apiKey}`,
      );
      const data = response.data;
      this.prepareTickerMetadata(data.tickers);
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
    const url = `${this.baseUrl}/v2/aggs/ticker/${ticker}/range/${multiplier}/${timespan}/${from}/${to}?apiKey=${this.apiKey}`;

    try {
      const response = await axios.get<TickerAggregateDetailV2>(url);

      if (response.status !== 200) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return response.data;
    } catch (error) {
      console.error(
        `Error fetching aggregated bar data for ticker-${ticker}, error: ${error.message}`,
      );
      return null;
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
      // Log a message indicating that the stock was found in the database
      this.logger.log(
        `Stock already exists in the database - ${tickerDetails.ticker}`,
      );
    }
    return tickerDetails;
  }
}
