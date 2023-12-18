import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { IsDateString, IsEnum, IsNumber, IsString } from 'class-validator';

export enum BuySellType {
  BUY = 'B',
  SELL = 'S',
}

export enum TradeStatus {
  PENDING = 'Pending',
  COMPLETED = 'Completed',
  ERRORED = 'Errored',
  SENDING = 'Sending',
  ACCEPTED = 'Accepted',
  EXECUTED = 'Executed',
  TRIGGERED = 'Triggered',
}

export enum TradeType {
  TRADE = 'T',
  ORDER = 'O',
}

@Schema({
  collection: 'trader',
})
export class TradeBotOrder extends Document {
  @Prop({ required: true })
  @IsEnum(TradeType)
  type: TradeType;

  @Prop({ required: true })
  @IsEnum(BuySellType)
  bs: BuySellType;

  @Prop({ required: true })
  @IsString()
  token: string;

  @Prop({ required: true })
  @IsString()
  symbol: string;

  @Prop({ required: true })
  @IsString()
  route: string;

  @Prop({ required: true })
  @IsNumber()
  price: number;

  @Prop({ required: true })
  @IsNumber()
  numberOfShares: number;

  @Prop({ default: 0 })
  @IsNumber()
  stopLossPercent: number;

  @Prop({ default: 0 })
  @IsNumber()
  takeProfitPercent: number;

  @Prop({ default: 0 })
  @IsNumber()
  timeLimitStop: number;

  @Prop({ required: true })
  @IsString()
  tradeNumber: string;

  @Prop({ required: true })
  @IsDateString()
  timeOfTrade: string;

  @Prop({ type: Types.ObjectId, required: true })
  @IsString()
  botId: Types.ObjectId;

  @Prop({ required: true })
  @IsString()
  botName: string;

  @Prop({ required: true, type: Date })
  @IsDateString()
  createdAt: string;

  @Prop({ required: true, type: Date })
  @IsDateString()
  updatedAt: string;

  // Added properties
  @Prop({ isRequired: true })
  @IsEnum(TradeStatus)
  status: TradeStatus;

  @Prop({ default: '' })
  @IsString()
  message: string;

  @Prop({ required: true })
  @IsString()
  rawCommand: string;
}

export const TradeBotOrderSchema = SchemaFactory.createForClass(TradeBotOrder);

// Add indexes
TradeBotOrderSchema.index({ botId: 1, timeOfTrade: -1 });
