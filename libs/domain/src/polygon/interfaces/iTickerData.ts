import { ObjectId } from 'mongoose';

export interface ITickerData {
  ticker: string;
  todaysChangePerc: number;
  todaysChange: number;
  updated: number;
  day: {
    o: number;
    h: number;
    l: number;
    c: number;
    v: number;
    vw: number;
  };
  min: {
    av: number;
    t: number;
    n: number;
    o: number;
    h: number;
    l: number;
    c: number;
    v: number;
    vw: number;
  };
  prevDay: {
    o: number;
    h: number;
    l: number;
    c: number;
    v: number;
    vw: number;
  };
}

export interface ITickerBarData {
  c: number;
  h: number;
  l: number;
  n: number;
  o: number;
  t: number;
  v: number;
  vw: number;
}

export interface AverageWithMinMax {
  average: number;
  min: number;
  max: number;
}

export interface iTickerAverages {
  today: {
    change: AverageWithMinMax;
    percentage: AverageWithMinMax;
  };
  volume: {
    today: AverageWithMinMax;
    prevDay: AverageWithMinMax;
    min: number;
  };
  weightedVolume: {
    today: AverageWithMinMax;
    prevDay: AverageWithMinMax;
    min: number;
  };
  price: {
    today: AverageWithMinMax;
    prevDay: AverageWithMinMax;
    min: number;
  };
}

export interface Criteria {
  botId: string | ObjectId;
  botName: string;
  percentChangePreviousClose: number;
  minPrice: number;
  maxPrice: number;
  dailyVolume: number;
  minMarketCap: number;
  maxMarketCap: number;
  rsi: number;
  volumeFilters: {
    minutes: number;
    percentChange: number;
  }[];
  priceFilters: {
    minutes: number;
    percentChange: number;
  }[];
}

export interface TickerDetailV3 {
  request_id: string;
  results: {
    ticker: string;
    name: string;
    market: string;
    locale: string;
    primary_exchange: string;
    type: string;
    active: boolean;
    currency_name: string;
    cik: string;
    composite_figi: string;
    share_class_figi: string;
    market_cap: number;
    phone_number: string;
    address: {
      address1: string;
      city: string;
      state: string;
      postal_code: string;
    };
    description: string;
    sic_code: string;
    sic_description: string;
    ticker_root: string;
    homepage_url: string;
    total_employees: number;
    list_date: string;
    branding: {
      logo_url: string;
      icon_url: string;
    };
    share_class_shares_outstanding: number;
    weighted_shares_outstanding: number;
    round_lot: number;
  };
  status: string;
}

export interface TickerAggregateDetailV2 {
  ticker: string;
  queryCount: number;
  resultsCount: number;
  adjusted: boolean;
  results: {
    v: number;
    vw: number;
    o: number;
    c: number;
    h: number;
    l: number;
    t: number;
    n: number;
  }[];
  status: string;
  request_id: string;
  count: number;
}

export interface TickerIndicatorDetailV1 {
  results: {
    underlying: {
      url: string;
    };
    values: {
      timestamp: number;
      value: number;
    }[];
  };
  status: string;
  request_id: string;
  next_url?: string;
}
