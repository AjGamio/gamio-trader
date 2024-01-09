import { Module } from '@nestjs/common';
import { SchedulerService } from './scheduler.service';
import { MongooseModule } from '@nestjs/mongoose';
import { TradeBot, TradeBotSchema } from '../trade-bot/tradeBot.entity';
import {
  TradeBotOrder,
  TradeBotOrderSchema,
} from '../trade-bot/tradeBotOder.entity';
import { ScheduleModule } from '@nestjs/schedule';
import { PolygonApiService } from '../polygon/polygon.service';
import { TradeService } from '../trade/trade.service';
import { DasLibModule } from '../das/das.module';
import { DasService } from '../das/das.service';
import { TradeBotsService } from '../trade-bot/tradebot.service';
import { TradeOrder, TradeOrderSchema } from '../trade-bot/tradeOrder.entity';
import { Stock, StockSchema } from '../polygon/stock.entity';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    MongooseModule.forFeature([
      { name: TradeBot.name, schema: TradeBotSchema },
      { name: TradeBotOrder.name, schema: TradeBotOrderSchema },
      { name: TradeOrder.name, schema: TradeOrderSchema },
      { name: Stock.name, schema: StockSchema },
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
