export interface ITradeBot {
  _id: {
    $oid: string;
  };
  botActiveTimes: {
    start: string;
    end: string;
  }[];
  name: string;
  updatedAt: string;
  createdAt: string;
  strategies: {
    parameters: {
      percentChangePreviousClose: number;
      minMarketCap: number;
      maxMarketCap: number;
      minPrice: number;
      maxPrice: number;
      percentPriceChangeLastXMinutes: number;
      percentPriceChangeLastXMinutesInterval: number;
      percentVolumeChangeLastXMinutes: number;
      percentVolumeChangeLastXMinutesInterval: number;
      relativeDailyVolume: number;
      dailyVolume: number;
      dailyRSI: number;
    };
    orders: {
      totalSharePrice: number;
      stopLossPercent: number;
      takeProfitPercent: number;
      timeLimitStop: number;
      longOrShort: 'long' | 'short';
      marketOrLimit: 'MKT' | 'LMT';
      limitOrderPercent: number;
    };
    stockType: string;
    locateRoutes: {
      name: string;
      maxFeePercent: number;
    }[];
    blacklist: string[];
  };
  updateAt: string;
}
