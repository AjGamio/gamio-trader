import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import {
  IsString,
  IsNumber,
  IsDateString,
  IsNotEmpty,
  IsObject,
} from 'class-validator';

/**
 * Represents a position in trading.
 */
@Schema({
  collection: 'positions',
  timestamps: true, // Automatically adds createdAt and updatedAt fields
})
export class Position extends Document {
  /**
   * Symbol of the position.
   */
  @Prop({ required: true, index: true }) // Add index on symb
  @IsString()
  @IsNotEmpty()
  symb: string;

  /**
   * Type of the position.
   */
  @Prop({ required: true })
  @IsNumber()
  @IsNotEmpty()
  type: number;

  /**
   * Quantity of shares in the position.
   */
  @Prop({ required: true })
  @IsNumber()
  @IsNotEmpty()
  qty: number;

  /**
   * Average cost of the position.
   */
  @Prop({ required: true })
  @IsNumber()
  @IsNotEmpty()
  avgcost: number;

  /**
   * Initial quantity of shares in the position.
   */
  @Prop({ required: true })
  @IsNumber()
  @IsNotEmpty()
  initqty: number;

  /**
   * Initial price of the position.
   */
  @Prop({ required: true })
  @IsNumber()
  @IsNotEmpty()
  initprice: number;

  /**
   * Realized profit or loss of the position.
   */
  @Prop({ required: true })
  @IsNumber()
  @IsNotEmpty()
  Realized: number;

  /**
   * Unrealized profit or loss of the position.
   */
  @Prop({ required: true })
  @IsNumber()
  @IsNotEmpty()
  UnRealized: number;

  /**
   * Bid price of the position.
   */
  @Prop({ required: true })
  @IsNumber()
  @IsNotEmpty()
  BidPrice: number;

  /**
   * Ask price of the position.
   */
  @Prop({ required: true })
  @IsNumber()
  @IsNotEmpty()
  AskPrice: number;

  /**
   * Current price of the position.
   */
  @Prop({ required: true })
  @IsNumber()
  @IsNotEmpty()
  CurrentPrice: number;

  /**
   * Creation time of the position.
   */
  @Prop({ required: true })
  @IsString()
  @IsNotEmpty()
  @IsDateString()
  CreatTime: string;

  /**
   * Created At date time
   */
  @Prop({ required: true, type: Date })
  @IsDateString()
  createdAt: string;

  /**
   * Updated At date time
   */
  @Prop({ required: true, type: Date })
  @IsDateString()
  updatedAt: string;

  /**
   * Amount object for orders and trades.
   */
  @Prop({ required: true, type: Object })
  @IsObject()
  @IsNotEmpty()
  amount: {
    order: {
      pending: number;
      accepted: number;
      executed: number;
    };
    trade: {
      pending: number;
      accepted: number;
      executed: number;
    };
  };

  /**
   * Additional properties.
   */
  @Prop({ required: true })
  @IsString()
  @IsNotEmpty()
  name: string;

  @Prop({ required: true })
  @IsString()
  @IsNotEmpty()
  market: string;

  @Prop({ required: true })
  @IsString()
  @IsNotEmpty()
  primary_exchange: string;

  @Prop({ required: true })
  @IsString()
  @IsNotEmpty()
  currency_name: string;

  @Prop({ required: true })
  @IsString()
  @IsNotEmpty()
  sic_description: string;
}

/**
 * Mongoose schema for the Position model.
 */
export const PositionSchema = SchemaFactory.createForClass(Position);

// Define indexes separately for more clarity
PositionSchema.index({ symb: 1, updatedAt: -1, createdAt: -1 }); // Index on symb
