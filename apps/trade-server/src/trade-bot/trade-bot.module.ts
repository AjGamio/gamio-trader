import { Module } from '@nestjs/common';
import { TradeBotsController } from './trade.bot.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { MongooseModule } from '@nestjs/mongoose';
import {
  TradeBot,
  TradeBotSchema,
} from 'gamio/domain/trade-bot/tradeBot.entity';
import {
  TradeBotOrder,
  TradeBotOrderSchema,
} from 'gamio/domain/trade-bot/tradeBotOder.entity';
import { SchedulerModule } from 'gamio/domain/scheduler/scheduler.module';
import { EnvConfig } from 'gamio/domain/config/env.config';

/**
 * Module for managing trade bots.
 */
@Module({
  imports: [
    // Register microservices client for TRADE_BOT_SERVICE
    ClientsModule.register([
      {
        name: 'TRADE_BOT_SERVICE',
        transport: Transport.TCP,
        options: {
          port: EnvConfig.PORT, // Change this port as needed
        },
      },
    ]),
    // Integrate with the Mongoose module for database operations
    MongooseModule.forFeature([
      { name: TradeBot.name, schema: TradeBotSchema },
      { name: TradeBotOrder.name, schema: TradeBotOrderSchema },
    ]),
    // Include the SchedulerModule for scheduling tasks
    SchedulerModule,
  ],
  providers: [], // No additional providers for now
  controllers: [TradeBotsController], // Include the TradeBotsController in the module
})
export class TradeBotModule {}
