import { Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({
  collection: 'trader',
})
export class TradeBotOrder extends Document {}

export const TradeBotOrderSchema = SchemaFactory.createForClass(TradeBotOrder);
