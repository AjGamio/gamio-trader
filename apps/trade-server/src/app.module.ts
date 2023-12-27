import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DasModule } from './das/das.module';
import { DasEventModule } from './das-event/das-event.module';
import { TradeBotModule } from './trade-bot/trade-bot.module';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { EnvConfig } from 'gamio/domain/config/env.config';

/**
 * Main application module.
 */
@Module({
  imports: [
    // Connect to MongoDB using the provided URL
    MongooseModule.forRoot(EnvConfig.MONGO_DB_URL),

    // Include the DasModule for DAS (Direct Access Service) functionality
    DasModule,

    // Include the DasEventModule for managing DAS events
    DasEventModule,

    // Include the TradeBotModule for managing trade bots
    TradeBotModule,

    AuthModule,

    UsersModule,
  ],
  controllers: [AppController], // Include the main application controller
  providers: [AppService], // Include the main application service
})
export class AppModule {}
