import {
  Controller,
  Get,
  Param,
  Post,
  Body,
  Put,
  Delete,
  Query,
  ParseIntPipe,
  BadRequestException,
} from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { OrderOrTradeType } from 'gamio/domain/das/interfaces/iData';
import { TradeBot } from 'gamio/domain/trade-bot/tradeBot.entity';
import {
  TradeBotOrder,
  TradeType,
} from 'gamio/domain/trade-bot/tradeBotOder.entity';
import { TradeOrder } from 'gamio/domain/trade-bot/tradeOrder.entity';
import { TradeBotsService } from 'gamio/domain/trade-bot/tradebot.service';
import { set } from 'lodash';

@Controller('trade-bots')
export class TradeBotsController {
  constructor(private readonly tradeBotsService: TradeBotsService) {}

  @Get() // Include type in the URL
  @ApiOperation({ summary: 'Get paginated and sorted trade orders' })
  @ApiResponse({
    status: 200,
    description: 'Paginated and sorted trade orders',
    type: TradeBotOrder,
    isArray: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Paginated and sorted trade orders',
    type: TradeOrder,
    isArray: true,
  })
  @ApiQuery({
    name: 'type',
    required: true,
    type: Number,
    description: 'Page number',
    example: 1,
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of items per page',
    example: 10,
  })
  @ApiQuery({
    name: 'orderBy',
    required: false,
    type: String,
    description: 'Field to sort by',
    example: 'createdAt',
  })
  @ApiQuery({
    name: 'orderDirection',
    required: false,
    enum: ['ASC', 'DESC'],
    type: String,
    description: 'Sort order (ASC or DESC)',
    example: 'DESC',
  })
  @ApiQuery({
    name: 'type',
    required: true,
    enum: OrderOrTradeType,
    type: String,
    description: 'Type of orders (bot-trades or orders or trades)',
    example: OrderOrTradeType.BotTrades,
  })
  async findAllOrders(
    @Query('type') type: OrderOrTradeType = OrderOrTradeType.BotTrades,
    @Query('page', ParseIntPipe) page: number = 1,
    @Query('limit', ParseIntPipe) limit: number = 10,
    @Query('orderBy') orderBy: keyof TradeBotOrder = 'timeOfTrade',
    @Query('orderDirection') orderDirection: 'ASC' | 'DESC' = 'DESC',
  ): Promise<{
    records: TradeBot[] | TradeBotOrder[] | TradeOrder[];
    total: number;
  }> {
    page = page === 0 ? 1 : page;
    const options = {
      skip: (page - 1) * limit,
      limit,
      sort: {
        [orderBy]: orderDirection === 'ASC' ? 1 : -1,
      },
    };

    switch (type) {
      case OrderOrTradeType.Bots:
        return await this.tradeBotsService.findAllBots(options);
      case OrderOrTradeType.BotTrades:
        return await this.tradeBotsService.findAllOrders(options);

      case OrderOrTradeType.Orders:
      case OrderOrTradeType.Trades:
        set(options, 'where', {
          type:
            type === OrderOrTradeType.Orders
              ? TradeType.ORDER
              : TradeType.TRADE,
        });
        return await this.tradeBotsService.findAllTrades(options);

      default:
        throw new BadRequestException(`Invalid 'type' parameter: ${type}`);
    }
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
