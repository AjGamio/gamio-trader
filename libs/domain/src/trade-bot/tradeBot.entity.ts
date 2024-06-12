import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import {
  IsArray,
  IsDateString,
  IsNumber,
  IsString,
  ValidateNested,
} from 'class-validator';

class BotActiveTimes {
  @IsString()
  start: string;

  @IsString()
  end: string;
}

class Parameters {
  @Prop({ required: true })
  @IsNumber()
  percentChangePreviousClose: number;

  @Prop({ required: true })
  @IsNumber()
  marketCap: number;

  @Prop({ required: true, min: 0 })
  @IsNumber()
  minPrice: number;

  @Prop({ required: true, min: 0 })
  @IsNumber()
  maxPrice: number;

  @Prop({ required: true })
  @IsNumber()
  percentPriceChangeLastXMinutes: number;

  @Prop({ required: true })
  @IsNumber()
  percentPriceChangeLastXMinutesInterval: number;

  @Prop({ required: true })
  @IsNumber()
  percentVolumeChangeLastXMinutes: number;

  @Prop({ required: true })
  @IsNumber()
  percentVolumeChangeLastXMinutesInterval: number;

  @Prop({ required: true })
  @IsNumber()
  relativeDailyVolume: number;

  @Prop({ required: true })
  @IsNumber()
  dailyVolume: number;

  @Prop({ required: true })
  @IsNumber()
  dailyRSI: number;
}

class Orders {
  @Prop({ required: true })
  @IsNumber()
  numberOfShares: number;

  @Prop({ required: true })
  @IsNumber()
  stopLossPercent: number;

  @Prop({ required: true })
  @IsNumber()
  takeProfitPercent: number;

  @Prop({ required: true })
  @IsNumber()
  timeLimitStop: number;

  @Prop({ required: true })
  @IsString()
  longOrShort: 'long' | 'short';

  @Prop({ required: true })
  @IsString()
  marketOrLimit: 'MKT' | 'LMT';

  @Prop({ required: true })
  @IsNumber()
  limitOrderPercent: number;
}

class LocateRoute {
  @IsString()
  name: string;

  @IsNumber()
  maxFeePercent: number;
}

class Strategies {
  @ValidateNested()
  parameters: Parameters;

  @ValidateNested()
  orders: Orders;

  @IsString()
  stockType: string;

  @IsArray()
  @ValidateNested({ each: true })
  locateRoutes: LocateRoute[];

  @IsArray()
  @IsString({ each: true })
  blacklist: string[];
}

@Schema({
  collection: 'bots',
})
export class TradeBot extends Document {
  @Prop({ required: true })
  @IsArray()
  @ValidateNested({ each: true })
  botActiveTimes: BotActiveTimes[];

  @Prop({ required: true })
  @IsString()
  name: string;

  @Prop({ required: true, type: Date })
  @IsDateString()
  updatedAt: string;

  @Prop({ required: true, type: Date })
  @IsDateString()
  createdAt: string;

  @Prop({ required: true })
  @ValidateNested()
  strategies: Strategies;

  @Prop({ required: true, type: Date })
  @IsDateString()
  updateAt: string;
}

export const TradeBotSchema = SchemaFactory.createForClass(TradeBot);
