import { Module } from '@nestjs/common';

import { TradeBotsService } from './TradeBotsService';

@Module({
  imports: [],
  providers: [TradeBotsService],
  exports: [TradeBotsService],
})
export class TradeBotModule { }
