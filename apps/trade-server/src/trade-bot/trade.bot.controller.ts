import {
  Controller,
  Get,
  Param,
  Post,
  Body,
  Put,
  Delete,
} from '@nestjs/common';
import { TradeBot } from 'gamio/domain/trade-bot/tradeBot.entity';
import { TradeBotOrder } from 'gamio/domain/trade-bot/tradeBotOder.entity';
import { TradeBotsService } from 'gamio/domain/trade-bot/tradebot.service';

@Controller('trade-bots')
export class TradeBotsController {
  constructor(private readonly tradeBotsService: TradeBotsService) {}

  @Get()
  findAll(): Promise<TradeBot[]> {
    return this.tradeBotsService.findAll();
  }

  @Get('/orders')
  findAllOrders(): Promise<TradeBotOrder[]> {
    return this.tradeBotsService.findAllOrders();
  }

  @Get(':id')
  findById(@Param('id') id: string): Promise<TradeBot> {
    return this.tradeBotsService.findById(id);
  }

  @Post()
  create(@Body() createTradeBotDto: TradeBot): Promise<TradeBot> {
    return this.tradeBotsService.create(createTradeBotDto);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateTradeBotDto: TradeBot,
  ): Promise<TradeBot> {
    return this.tradeBotsService.update(id, updateTradeBotDto);
  }

  @Delete(':id')
  delete(@Param('id') id: string): Promise<void> {
    return this.tradeBotsService.delete(id);
  }
}
