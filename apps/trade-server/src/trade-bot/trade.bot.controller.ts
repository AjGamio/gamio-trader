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
  UseGuards,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiTags,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { OrderOrTradeType } from 'gamio/domain/das/interfaces/iData';
import { TradeBot } from 'gamio/domain/trade-bot/tradeBot.entity';
import {
  TradeBotOrder,
  TradeType,
} from 'gamio/domain/trade-bot/tradeBotOder.entity';
import { TradeOrder } from 'gamio/domain/trade-bot/tradeOrder.entity';
import { TradeBotsService } from 'gamio/domain/trade-bot/tradebot.service';
import { set } from 'lodash';
import { JwtAuthGuard } from '../guards/jwt.auth.guard';

/**
 * Controller for managing trade bots.
 */
@ApiTags('Trade Bots')
@Controller('trade-bots')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TradeBotsController {
  constructor(private readonly tradeBotsService: TradeBotsService) {}

  /**
   * Get paginated and sorted trade orders.
   * @param type - Type of orders (bot-trades or orders or trades)
   * @param page - Page number
   * @param limit - Number of items per page
   * @param orderBy - Field to sort by
   * @param orderDirection - Sort order (ASC or DESC)
   * @returns Paginated and sorted trade orders
   */
  @Get()
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
    enum: OrderOrTradeType,
    type: String,
    description: 'Type of orders (bot-trades or orders or trades)',
    example: OrderOrTradeType.BotTrades,
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

  /**
   * Find trade bot by ID.
   * @param id - Trade bot ID
   * @returns Trade bot details
   */
  @Get(':id')
  @ApiOperation({ summary: 'Find trade bot by ID' })
  @ApiParam({ name: 'id', type: String, description: 'Trade bot ID' })
  @ApiResponse({
    status: 200,
    description: 'Trade bot details',
    type: TradeBot,
  })
  findById(@Param('id') id: string): Promise<TradeBot> {
    return this.tradeBotsService.findById(id);
  }

  /**
   * Create a new trade bot.
   * @param createTradeBotDto - Trade bot details
   * @returns Created trade bot
   */
  @Post()
  @ApiOperation({ summary: 'Create a new trade bot' })
  @ApiBody({ type: TradeBot, description: 'Trade bot details' })
  @ApiResponse({
    status: 201,
    description: 'Created trade bot',
    type: TradeBot,
  })
  create(@Body() createTradeBotDto: TradeBot): Promise<TradeBot> {
    return this.tradeBotsService.create(createTradeBotDto);
  }

  /**
   * Update trade bot details.
   * @param id - Trade bot ID
   * @param updateTradeBotDto - Updated trade bot details
   * @returns Updated trade bot
   */
  @Put(':id')
  @ApiOperation({ summary: 'Update trade bot details' })
  @ApiParam({ name: 'id', type: String, description: 'Trade bot ID' })
  @ApiBody({ type: TradeBot, description: 'Updated trade bot details' })
  @ApiResponse({
    status: 200,
    description: 'Updated trade bot',
    type: TradeBot,
  })
  update(
    @Param('id') id: string,
    @Body() updateTradeBotDto: TradeBot,
  ): Promise<TradeBot> {
    return this.tradeBotsService.update(id, updateTradeBotDto);
  }

  /**
   * Delete a trade bot.
   * @param id - Trade bot ID
   * @returns No content
   */
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a trade bot' })
  @ApiParam({ name: 'id', type: String, description: 'Trade bot ID' })
  @ApiResponse({
    status: 204,
    description: 'No content',
  })
  delete(@Param('id') id: string): Promise<void> {
    return this.tradeBotsService.delete(id);
  }
}
