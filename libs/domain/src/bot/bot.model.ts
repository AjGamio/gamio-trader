import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Type } from 'class-transformer';
import { ValidateNested, IsString, IsDateString } from 'class-validator';
import {
  ParametersType,
  OrderOptions,
  BotUserCredentials,
} from './nested.bot.classes';

@Schema({
  collection: 'botsV2',
})
export class BotModel extends Document {
  @Prop({ required: true })
  @IsString()
  name: string;

  @Prop({ required: true, type: Date })
  @IsDateString()
  updatedAt: string;

  @Prop({ required: true, type: Date })
  @IsDateString()
  createdAt: string;

  @Prop({ type: ParametersType, required: true })
  @ValidateNested()
  @Type(() => ParametersType)
  parameters: {
    RTH: ParametersType;
    ATH: ParametersType;
  };

  @Prop({ type: OrderOptions, required: true })
  @ValidateNested()
  @Type(() => OrderOptions)
  order: {
    RTH: OrderOptions;
    ATH: OrderOptions;
    profitPercent: number;
    stopLossPercent: number;
    timeLimitStop: { duration: number; enabled: boolean };
    timeLimitStopBeforeClose: { duration: number; enabled: boolean };
  };

  @Prop({ type: BotUserCredentials, required: true })
  @Type(() => BotUserCredentials)
  credential: BotUserCredentials;
}

export const BotSchema = SchemaFactory.createForClass(BotModel);
