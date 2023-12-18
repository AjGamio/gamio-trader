import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { TradeType } from './tradeBotOder.entity';
import { IsDateString, IsEnum } from 'class-validator';

@Schema({
  collection: 'tradeOrders', // Specify collection name
})
export class TradeOrder extends Document {
  @Prop({ required: true, type: String })
  @IsEnum(TradeType)
  type: TradeType;

  @Prop({ required: true })
  id: string;

  @Prop({ required: true })
  token: string;

  @Prop({ required: true })
  symb: string;

  @Prop({ required: true })
  bs: string;

  @Prop({ required: true })
  mktLmt: string;

  @Prop({ required: true })
  qty: number;

  @Prop()
  lvqty: number;

  @Prop({ required: true })
  cxlqty: number;

  @Prop()
  price: number;

  @Prop({ required: true })
  route: string;

  @Prop({ required: true })
  status: string;

  @Prop({ required: true })
  time: string;

  @Prop({ required: true, type: Date })
  @IsDateString()
  createdAt: string;

  @Prop({ required: true, type: Date })
  @IsDateString()
  updatedAt: string;
}

export const TradeOrderSchema = SchemaFactory.createForClass(TradeOrder);

// Add indexes
TradeOrderSchema.index({ _id: 1, updateAt: -1 });
