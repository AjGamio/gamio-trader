import { Module } from '@nestjs/common';
import { TradeBotsService } from './tradeBot.service';

@Module({
  imports: [],
  providers: [TradeBotsService],
  exports: [TradeBotsService],
})
export class TradeBotModule {}
