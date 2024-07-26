import { Document } from 'mongoose';

/**
 * Represents a market type.
 * @interface
 */
export interface IMarketType {
  /** The name of the market. */
  name: string;
  /** The timings of the market. */
  timings: string;
  /** Whether the market is enabled or not. */
  enabled: boolean;
}

/**
 * Represents the order options.
 * @interface
 */
export interface IOrderOptionsType {
  /** Whether market orders are allowed or not. */
  marketOrders: boolean;
  /** Whether limit orders are allowed or not. */
  limitOrders: boolean;
  /** Whether bid orders are allowed or not. */
  bidOrders: boolean;
}

/**
 * Represents the active times.
 * @interface
 */
export interface IActiveTimes {
  /** The start time. */
  start: string;
  /** The end time. */
  end: string;
}

/**
 * Represents the previous close range.
 * @interface
 */
export interface IPreviousClose {
  /** The minimum value of the previous close range. */
  min: number;
  /** The maximum value of the previous close range. */
  max: number;
}

/**
 * Represents the market cap range.
 * @interface
 */
export interface IMarketCap {
  /** The minimum value of the market cap range. */
  min: number;
  /** The maximum value of the market cap range. */
  max: number;
}

/**
 * Represents the price range.
 * @interface
 */
export interface IPrice {
  /** The minimum value of the price range. */
  min: number;
  /** The maximum value of the price range. */
  max: number;
}

/**
 * Represents the percent change range.
 * @interface
 */
export interface IPercentChange {
  /** The minimum value of the percent change range. */
  min: number;
  /** The maximum value of the percent change range. */
  max: number;
}

/**
 * Represents the relative daily volume range.
 * @interface
 */
export interface IRelativeDailyVolume {
  /** The minimum value of the relative daily volume range. */
  min: number;
  /** The maximum value of the relative daily volume range. */
  max: number;
}

/**
 * Represents the volume range.
 * @interface
 */
export interface IVolume {
  /** The minimum value of the volume range. */
  min: number;
  /** The maximum value of the volume range. */
  max: number;
}

/**
 * Represents the RSI range.
 * @interface
 */
export interface IRsi {
  /** The minimum value of the RSI range. */
  min: number;
  /** The maximum value of the RSI range. */
  max: number;
}

/**
 * Represents the entry interval.
 * @interface
 */
export interface IEntryInterval {
  /** The entry interval in seconds. */
  sec: number;
}

/**
 * Represents the limit order refresh interval.
 * @interface
 */
export interface ILimitOrderRefreshInterval {
  /** The limit order refresh interval in seconds. */
  sec: number;
}

/**
 * Represents the parameters type.
 * @interface
 */
export interface IParametersType {
  /** The active times. */
  activeTimes: IActiveTimes;
  /** The previous close range. */
  previousClose: IPreviousClose;
  /** The market cap range. */
  marketCap: IMarketCap;
  /** The price range. */
  price: IPrice;
  /** The percent change range. */
  percentChange: IPercentChange;
  /** The relative daily volume range. */
  relativeDailyVolume: IRelativeDailyVolume;
  /** The volume range. */
  volume: IVolume;
  /** The RSI range. */
  rsi: IRsi;
  /** The last minute value. */
  lastMinute: number;
  /** The position size amount. */
  positionSizeAmount: number;
  /** The number of entries. */
  noOfEntries: number;
  /** The entry interval. */
  entryInterval: IEntryInterval;
  /** The limit order refresh interval. */
  limitOrderRefreshInterval: ILimitOrderRefreshInterval;
  /** The market types. */
  market: IMarketType[];
}

/**
 * Represents the session type.
 * @interface
 */
export interface ISessionType {
  /** The parameters. */
  parameters: IParametersType;
  /** The market types. */
  market: IMarketType[];
  /** The order options. */
  order: {
    options: IOrderOptionsType;
  };
}

/**
 * Represents the time limit stop.
 * @interface
 */
export interface ITimeLimitStop {
  /** The duration of the time limit stop. */
  duration: number;
  /** Whether the time limit stop is enabled or not. */
  enabled: boolean;
}

/**
 * Represents the bot model.
 * @interface
 * @extends {Document}
 */
export interface IBotModel extends Document {
  /** The parameters. */
  parameters: {
    RTH: IParametersType;
    ATH: IParametersType;
  };
  /** The order options. */
  order: {
    RTH: IOrderOptionsType;
    ATH: IOrderOptionsType;
    /** The profit percent. */
    profitPercent: number;
    /** The stop loss percent. */
    stopLossPercent: number;
    /** The time limit stop. */
    timeLimitStop: ITimeLimitStop;
    /** The time limit stop before close. */
    timeLimitStopBeforeClose: ITimeLimitStop;
  };
  /** The credentials. */
  credential: {
    /** The username. */
    username: string;
    /** The account. */
    account: string;
    /** The password. */
    password: string;
    /** The polygon credentials. */
    polygon: {
      /** The polygon key. */
      key: string;
    };
  };
}
