import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsString,
  IsUrl,
  IsOptional,
  IsDate,
  IsDateString,
} from 'class-validator';

@Schema()
export class Address {
  @Prop({ required: true })
  @IsString()
  @IsNotEmpty()
  address1: string;

  @Prop({ required: true })
  @IsString()
  @IsNotEmpty()
  city: string;

  @Prop({ required: true })
  @IsString()
  @IsNotEmpty()
  state: string;

  @Prop({ required: true })
  @IsString()
  @IsNotEmpty()
  postal_code: string;
}

@Schema()
export class Branding {
  @Prop()
  @IsOptional()
  @IsUrl()
  logo_url?: string;

  @Prop()
  @IsOptional()
  @IsUrl()
  icon_url?: string;
}

@Schema()
export class Stock extends Document {
  @Prop({ required: true, unique: true })
  @IsString()
  @IsNotEmpty()
  request_id: string;

  @Prop({ required: true })
  @IsString()
  @IsNotEmpty()
  ticker: string;

  @Prop({ required: true })
  @IsString()
  @IsNotEmpty()
  name: string;

  @Prop({ required: true, enum: ['stocks', 'other'] })
  @IsString()
  @IsNotEmpty()
  market: string;

  @Prop({ required: true })
  @IsString()
  @IsNotEmpty()
  locale: string;

  @Prop({ required: true })
  @IsString()
  @IsNotEmpty()
  primary_exchange: string;

  @Prop({ required: true })
  @IsString()
  @IsNotEmpty()
  type: string;

  @Prop({ required: true })
  @IsBoolean()
  active: boolean;

  @Prop({ required: true })
  @IsString()
  @IsNotEmpty()
  currency_name: string;

  @Prop({ required: true })
  @IsString()
  @IsNotEmpty()
  cik: string;

  @Prop()
  @IsString()
  composite_figi?: string;

  @Prop()
  @IsString()
  share_class_figi?: string;

  @Prop({ required: true })
  @IsNumber()
  market_cap: number;

  @Prop({ required: true })
  @IsString()
  @IsNotEmpty()
  phone_number: string;

  @Prop({ required: true, type: Address })
  @IsNotEmpty()
  address: Address;

  @Prop({ required: true })
  @IsString()
  @IsNotEmpty()
  description: string;

  @Prop({ required: true })
  @IsString()
  @IsNotEmpty()
  sic_code: string;

  @Prop({ required: true })
  @IsString()
  @IsNotEmpty()
  sic_description: string;

  @Prop({ required: true })
  @IsString()
  @IsNotEmpty()
  ticker_root: string;

  @Prop({ required: true })
  @IsUrl()
  @IsOptional()
  homepage_url?: string;

  @Prop({ required: true })
  @IsNumber()
  total_employees: number;

  @Prop({ required: true })
  @IsDate()
  @IsOptional()
  list_date?: Date;

  @Prop({ required: true, type: Branding })
  @IsOptional()
  branding?: Branding;

  @Prop({ required: true })
  @IsNumber()
  share_class_shares_outstanding: number;

  @Prop({ required: true })
  @IsNumber()
  weighted_shares_outstanding: number;

  @Prop({ required: true })
  @IsNumber()
  round_lot: number;

  @Prop({ required: true, type: Date })
  @IsDateString()
  createdAt: string;

  @Prop({ required: true, type: Date })
  @IsDateString()
  updatedAt: string;
}

export const StockSchema = SchemaFactory.createForClass(Stock);
// Add indexes
StockSchema.index({ ticker: 1 });
