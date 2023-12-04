import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DasModule } from './das/das.module';
import { DasEventModule } from './das-event/das-event.module';
import { TradeBotModule } from './trade-bot/trade-bot.module';
import { MongooseModule } from '@nestjs/mongoose';
import { EnvConfig } from './config/env.config';

@Module({
  imports: [
    MongooseModule.forRoot(EnvConfig.MONGO_DB_URL),
    DasModule,
    DasEventModule,
    TradeBotModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
