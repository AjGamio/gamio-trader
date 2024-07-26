import { IsString, IsNumber, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

export class ActiveTimes {
  @IsString()
  start: string;

  @IsString()
  end: string;
}

export class PreviousClose {
  @IsNumber()
  min: number;

  @IsNumber()
  max: number;
}

export class MarketCap {
  @IsNumber()
  min: number;

  @IsNumber()
  max: number;
}

export class Price {
  @IsNumber()
  min: number;

  @IsNumber()
  max: number;
}

export class PercentChange {
  @IsNumber()
  min: number;

  @IsNumber()
  max: number;
}

export class RelativeDailyVolume {
  @IsNumber()
  min: number;

  @IsNumber()
  max: number;
}

export class Volume {
  @IsNumber()
  min: number;

  @IsNumber()
  max: number;
}

export class Rsi {
  @IsNumber()
  min: number;

  @IsNumber()
  max: number;
}

export class EntryInterval {
  @IsNumber()
  sec: number;
}

export class LimitOrderRefreshInterval {
  @IsNumber()
  sec: number;
}

export class Market {
  @IsString()
  name: string;

  @IsString()
  timings: string;

  @IsBoolean()
  enabled: boolean;
}

export class ParametersType {
  @Type(() => ActiveTimes)
  activeTimes: ActiveTimes;

  @Type(() => PreviousClose)
  previousClose: PreviousClose;

  @Type(() => MarketCap)
  marketCap: MarketCap;

  @Type(() => Price)
  price: Price;

  @Type(() => PercentChange)
  percentChange: PercentChange;

  @Type(() => RelativeDailyVolume)
  relativeDailyVolume: RelativeDailyVolume;

  @Type(() => Volume)
  volume: Volume;

  @Type(() => Rsi)
  rsi: Rsi;

  @IsNumber()
  lastMinute: number;

  @IsNumber()
  positionSizeAmount: number;

  @IsNumber()
  noOfEntries: number;

  @Type(() => EntryInterval)
  entryInterval: EntryInterval;

  @Type(() => LimitOrderRefreshInterval)
  limitOrderRefreshInterval: LimitOrderRefreshInterval;

  @Type(() => Market)
  markets: Market[];
}

export class OrderOptions {
  @IsBoolean()
  marketOrders: boolean;

  @IsBoolean()
  limitOrders: boolean;

  @IsBoolean()
  bidOrders: boolean;
}

export class BotUserCredentials {
  @IsString()
  username: string;

  @IsString()
  account: string;

  @IsString()
  password: string;

  @IsString()
  polygonKey: string;
}
