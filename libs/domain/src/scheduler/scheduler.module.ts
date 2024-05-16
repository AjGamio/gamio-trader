import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';

import { DasLibModule } from '../das/das.module';
import { DasService } from '../das/das.service';
import { PolygonApiService } from '../polygon/polygon.service';
import { Stock, StockSchema } from '../polygon/stock.entity';
import { Position, PositionSchema } from '../trade-bot/positionEntity';
import { TradeBot, TradeBotSchema } from '../trade-bot/tradeBot.entity';
import {
  TradeBotOrder,
  TradeBotOrderSchema,
} from '../trade-bot/tradeBotOder.entity';
import { TradeOrder, TradeOrderSchema } from '../trade-bot/tradeOrder.entity';
import { TradeService } from '../trade/trade.service';
import { SchedulerService } from './scheduler.service';
import { TradeBotsService } from '../trade-bot/tradeBot.service';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    MongooseModule.forFeature([
      { name: TradeBot.name, schema: TradeBotSchema },
      { name: TradeBotOrder.name, schema: TradeBotOrderSchema },
      { name: TradeOrder.name, schema: TradeOrderSchema },
      { name: Stock.name, schema: StockSchema },
      { name: Position.name, schema: PositionSchema },
    ]),
    DasLibModule,
  ],
  providers: [
    SchedulerService,
    PolygonApiService,
    TradeService,
    DasService,
    TradeBotsService,
  ],
  exports: [
    SchedulerService,
    PolygonApiService,
    TradeService,
    DasService,
    TradeBotsService,
  ],
})
export class SchedulerModule {}
