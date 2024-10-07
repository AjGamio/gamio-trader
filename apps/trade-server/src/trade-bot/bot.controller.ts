import { BotModel } from 'gamio/domain/bot/bot.model';
import CreateTradeBotDto from 'gamio/domain/bot/dtos/create-bot.dto';
import UpdateTradeBotDto from 'gamio/domain/bot/dtos/update-bot.dto';
import { OrderOrTradeType } from 'gamio/domain/das/interfaces/iData';
import { TradeBotsService } from 'gamio/domain/trade-bot/tradeBot.service';
import {
  TradeBotOrder,
  TradeType,
} from 'gamio/domain/trade-bot/tradeBotOder.entity';
import { TradeOrder } from 'gamio/domain/trade-bot/tradeOrder.entity';
import { set } from 'lodash';

import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { JwtAuthGuard } from '../guards/jwt.auth.guard';

@Controller('bots/v2')
@ApiTags('Trade Bots V2')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class BotController {
  constructor(private readonly tradeBotService: TradeBotsService) {}

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
    records: BotModel[] | TradeBotOrder[] | TradeOrder[];
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
        return await this.tradeBotService.findAllBotsV2(options);
      case OrderOrTradeType.BotTrades:
        return await this.tradeBotService.findAllOrders(options);

      case OrderOrTradeType.Orders:
      case OrderOrTradeType.Trades:
        set(options, 'where', {
          type:
            type === OrderOrTradeType.Orders
              ? TradeType.ORDER
              : TradeType.TRADE,
        });
        return await this.tradeBotService.findAllTrades(options);

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
    type: BotModel,
  })
  findById(@Param('id') id: string): Promise<BotModel> {
    return this.tradeBotService.findByIdV2(id);
  }

  /**
   * Create a new trade bot.
   * @param createTradeBotDto - Trade bot details
   * @returns Created trade bot
   */
  @Post()
  @ApiOperation({ summary: 'Create a new trade bot' })
  @ApiBody({ type: BotModel, description: 'Trade bot details' })
  @ApiResponse({
    status: 201,
    description: 'Created trade bot',
    type: BotModel,
  })
  create(@Body() createTradeBotDto: CreateTradeBotDto): Promise<BotModel> {
    return this.tradeBotService.createV2(createTradeBotDto);
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
  @ApiBody({ type: BotModel, description: 'Updated trade bot details' })
  @ApiResponse({
    status: 200,
    description: 'Updated trade bot',
    type: BotModel,
  })
  update(
    @Param('id') id: string,
    @Body() updateTradeBotDto: UpdateTradeBotDto,
  ): Promise<BotModel> {
    return this.tradeBotService.updateV2(id, updateTradeBotDto);
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
    return this.tradeBotService.deleteV2(id);
  }
}
