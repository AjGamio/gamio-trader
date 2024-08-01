// import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
// import { IsBoolean, IsNumber, IsString, Max, Min } from 'class-validator';
// import { Type } from 'class-transformer';

// @Schema()
// export class MarketType {
//   @Prop({ required: true })
//   @IsString()
//   name: string;

//   @Prop({ required: true })
//   @IsString()
//   timings: string;

//   @Prop({ required: true })
//   @IsBoolean()
//   enabled: boolean;
// }

// const MarketTypeSchema = SchemaFactory.createForClass(MarketType);

// @Schema()
// export class OrderOptionsType {
//   @Prop({ required: true })
//   @IsBoolean()
//   marketOrders: boolean;

//   @Prop({ required: true })
//   @IsBoolean()
//   limitOrders: boolean;

//   @Prop({ required: true })
//   @IsBoolean()
//   bidOrders: boolean;
// }

// const OrderOptionsTypeSchema = SchemaFactory.createForClass(OrderOptionsType);

// @Schema()
// export class ActiveTimes {
//   @Prop({ required: true })
//   @IsString()
//   start: string;

//   @Prop({ required: true })
//   @IsString()
//   end: string;
// }

// const ActiveTimesSchema = SchemaFactory.createForClass(ActiveTimes);

// // ... (other classes omitted for brevity)

// @Schema()
// export class ParametersType {
//   @Prop({ type: ActiveTimesSchema, required: true })
//   @Type(() => ActiveTimes)
//   activeTimes: ActiveTimes;

//   @Prop({ required: true })
//   @Type(() => Number)
//   @Min(0)
//   @Max(Number.MAX_SAFE_INTEGER)
//   previousClose: {
//     min: number;
//     max: number;
//   };

//   // ... (other properties omitted for brevity)

//   @Prop({ type: [{ type: MarketTypeSchema }], required: true })
//   @Type(() => MarketType)
//   market: MarketType[];
// }

// const ParametersTypeSchema = SchemaFactory.createForClass(ParametersType);

// @Schema()
// export class SessionType {
//   @Prop({ type: ParametersTypeSchema, required: true })
//   @Type(() => ParametersType)
//   parameters: ParametersType;

//   @Prop({ type: [{ type: MarketTypeSchema }], required: true })
//   @Type(() => MarketType)
//   market: MarketType[];

//   @Prop({ type: OrderOptionsTypeSchema, required: true })
//   @Type(() => OrderOptionsType)
//   order: {
//     options: OrderOptionsType;
//   };
// }

// export const SessionTypeSchema = SchemaFactory.createForClass(SessionType);

// @Schema()
// export class TimeLimitStop {
//   @Prop({ required: true })
//   @IsNumber()
//   @Min(0)
//   duration: number;

//   @Prop({ required: true })
//   @IsBoolean()
//   enabled: boolean;
// }

// const TimeLimitStopSchema = SchemaFactory.createForClass(TimeLimitStop);

// @Schema({
//   collection: 'botV2',
// })
// export class BotModel extends Document {
//   @Prop({
//     type: { RTH: ParametersTypeSchema, ATH: ParametersTypeSchema },
//     required: true,
//   })
//   @Type(() => ParametersType)
//   parameters: {
//     RTH: ParametersType;
//     ATH: ParametersType;
//   };

//   @Prop({
//     type: {
//       RTH: OrderOptionsTypeSchema,
//       ATH: OrderOptionsTypeSchema,
//       profitPercent: Number,
//       stopLossPercent: Number,
//       timeLimitStop: TimeLimitStopSchema,
//       timeLimitStopBeforeClose: TimeLimitStopSchema,
//     },
//     required: true,
//   })
//   @Type(() => OrderOptionsType)
//   order: {
//     RTH: OrderOptionsType;
//     ATH: OrderOptionsType;
//     profitPercent: number;
//     stopLossPercent: number;
//     timeLimitStop: TimeLimitStop;
//     timeLimitStopBeforeClose: TimeLimitStop;
//   };

//   @Prop({ required: true })
//   @IsString()
//   credential: {
//     username: string;
//     account: string;
//     password: string;
//     polygon: {
//       key: string;
//     };
//   };
// }

// const BotModelSchema = SchemaFactory.createForClass(BotModel);
// export { BotModelSchema };
