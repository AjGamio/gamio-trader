import { Module } from '@nestjs/common';
import { TradeBotsController } from './trade.bot.controller';
import { TradeBotsService } from 'gamio/domain/trade-bot/tradebot.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { EnvConfig } from '../config/env.config';
import { MongooseModule } from '@nestjs/mongoose';
import {
  TradeBot,
  TradeBotSchema,
} from 'gamio/domain/trade-bot/tradeBot.entity';
import { TradeBotOrder, TradeBotOrderSchema } from 'gamio/domain/trade-bot/tradeBotOder.entity';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'TRADE_BOT_SERVICE',
        transport: Transport.TCP,
        options: {
          port: EnvConfig.PORT, // Change this port as needed
        },
      },
    ]),
    MongooseModule.forFeature([
      { name: TradeBot.name, schema: TradeBotSchema },
      { name: TradeBotOrder.name, schema: TradeBotOrderSchema },
    ]),
  ],
  providers: [TradeBotsService],
  controllers: [TradeBotsController],
})
export class TradeBotModule {}
