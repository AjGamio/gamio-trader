import { isNil } from 'lodash';
import { FilterQuery, Model } from 'mongoose';

import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { generateBotName } from '../das/common/trade.helper';
import { TradeBot } from './tradeBot.entity';
import { TradeBotOrder, TradeStatus, TradeType } from './tradeBotOder.entity';
import { TradeOrder } from './tradeOrder.entity';
import { EnvConfig } from '../config/env.config';
import { Position } from './positionEntity';

@Injectable()
export class TradeBotsService {
  private readonly logger: Logger;
  constructor(
    @InjectModel(TradeBot.name) private readonly tradeBotModel: Model<TradeBot>,
    @InjectModel(TradeBotOrder.name)
    private readonly tradeBotOrderModel: Model<TradeBotOrder>,
    @InjectModel(TradeOrder.name)
    private readonly tradeModel: Model<TradeOrder>,
    @InjectModel(Position.name)
    private readonly positionModel: Model<Position>,
  ) {
    this.logger = new Logger(TradeBotsService.name);
  }

  async findAllBots(options: {
    skip: number;
    limit: number;
    sort: {
      [x: string]: number;
    };
    where?: FilterQuery<TradeBot>;
  }): Promise<{ records: TradeBot[]; total: number }> {
    const [records, total] = await Promise.all([
      this.tradeBotModel.find(options.where ?? {}, null, options).exec(),
      this.tradeBotModel.countDocuments(options.where ?? {}).exec(),
    ]);
    return { records, total };
  }

  async findAllPositions(options: {
    skip: number;
    limit: number;
    sort: {
      [x: string]: number;
    };
    where?: FilterQuery<Position>;
  }): Promise<{ records: Position[]; total: number }> {
    const [records, total] = await Promise.all([
      this.positionModel.find(options.where ?? {}, null, options).exec(),
      this.positionModel.countDocuments(options.where ?? {}).exec(),
    ]);
    return { records, total };
  }

  async findAllOrders(options: {
    skip: number;
    limit: number;
    sort: {
      [x: string]: number;
    };
    where?: FilterQuery<TradeBotOrder>;
  }): Promise<{ records: TradeBotOrder[]; total: number }> {
    const [records, total] = await Promise.all([
      this.tradeBotOrderModel.find(options.where ?? {}, null, options).exec(),
      this.tradeBotOrderModel.countDocuments(options.where ?? {}).exec(),
    ]);
    return { records, total };
  }

  async findAllTrades(options: {
    skip: number;
    limit: number;
    sort: {
      [x: string]: number;
    };
    where?: FilterQuery<TradeOrder>;
  }): Promise<{ records: TradeOrder[]; total: number }> {
    const [records, total] = await Promise.all([
      this.tradeModel.find(options.where ?? {}, null, options).exec(),
      this.tradeModel.countDocuments(options.where ?? {}).exec(),
    ]);
    return { records, total };
  }

  async findById(id: string): Promise<TradeBot> {
    const tradeBot = await this.tradeBotModel.findById(id).exec();
    if (!tradeBot) {
      throw new NotFoundException(`TradeBot with ID ${id} not found`);
    }
    return tradeBot;
  }

  async create(createTradeBotDto: TradeBot): Promise<TradeBot> {
    const botName = generateBotName();
    const botCount = await this.tradeBotModel.countDocuments({ name: botName });
    let createdTradeBot = new this.tradeBotModel(createTradeBotDto);
    createdTradeBot = Object.assign(createdTradeBot, createTradeBotDto);
    createdTradeBot = Object.assign(createdTradeBot, {
      updatedAt: new Date(),
      createdAt: new Date(),
      name: botCount > 0 ? `${botName}-${botCount}` : botName,
    });
    await this.tradeBotModel.collection.insertOne(createdTradeBot, {});
    return createdTradeBot;
  }

  async update(id: string, updateTradeBotDto: TradeBot): Promise<TradeBot> {
    updateTradeBotDto = Object.assign(updateTradeBotDto, {
      updatedAt: new Date(),
    });
    const updatedTradeBot = await this.tradeBotModel
      .findByIdAndUpdate(id, updateTradeBotDto, { new: true })
      .exec();
    if (!updatedTradeBot) {
      throw new NotFoundException(`TradeBot with ID ${id} not found`);
    }
    return updatedTradeBot;
  }

  async delete(id: string): Promise<void> {
    const result = await this.tradeBotModel.deleteOne({ _id: id }).exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException(`TradeBot with ID ${id} not found`);
    }
  }

  async addBotOrder(order: TradeOrder) {
    try {
      const result = await this.tradeModel.collection.insertOne(order);
      if (result.acknowledged) {
        this.logger.log(`Added new order for symbol- ${order.symb}`);
      } else {
        this.logger.warn(`Unable to add new order for symbol- ${order.symb}`);
      }
      return order;
    } catch (err) {
      this.logger.error(
        `Unable to add new order for symbol- ${order.symb} due to ${err.message}`,
      );
    }
  }

  async upsertBotOrder(order: TradeOrder) {
    const msg = `[${order.type === TradeType.ORDER ? 'Order' : 'Trade'}] for symbol - ${order.symb} & token - ${order.token}`;
    try {
      const filter = {
        id: order.id,
        token: order.token,
        symb: order.symb,
        bs: order.bs,
        mktLmt: order.mktLmt,
        qty: order.qty ?? 0,
        lvqty: order.lvqty ?? 0,
        cxlqty: order.cxlqty ?? 0,
        price: order.price ?? 0,
        route: order.route,
        status: order.status,
        time: order.time,
      };
      const update = { $set: order };

      const result = await this.tradeModel.updateOne(filter, update, {
        upsert: true,
        setDefaultsOnInsert: true,
      });

      if (result.upsertedCount > 0) {
        this.logger.log(`Added new ${msg}`);
      } else if (result.modifiedCount > 0) {
        if (EnvConfig.ENABLE_DEBUG) {
          this.logger.log(`Updated existing ${msg}`);
        }
      } else if (EnvConfig.ENABLE_DEBUG) {
        this.logger.warn(`No changes made for ${msg}`);
      }

      return order;
    } catch (err) {
      this.logger.error(`Unable to upsert ${msg} due to ${err.message}`);
    }
  }

  async updateTradeBotOrder(
    token: string,
    tradeNumber: string,
    status: TradeStatus,
  ) {
    try {
      const tradeBotOrderUpdated =
        await this.tradeBotOrderModel.collection.updateOne(
          {
            token,
            status: {
              $nin: [
                TradeStatus.COMPLETED,
                TradeStatus.EXECUTED,
                TradeStatus.SENDING,
              ],
            },
          },
          {
            $set: {
              status,
              tradeNumber,
              timeOfTrade: new Date(),
              updatedAt: new Date(),
              type: TradeType.TRADE,
            },
          },
        );

      if (
        !isNil(tradeBotOrderUpdated) &&
        tradeBotOrderUpdated.acknowledged &&
        tradeBotOrderUpdated.matchedCount > 0 &&
        tradeBotOrderUpdated.modifiedCount > 0
      ) {
        this.logger.log(
          `Updated order for token - ${token} with tradeNumber- ${tradeNumber} & status: ${status}`,
        );
      } else {
        this.logger.warn(
          `Unable to update order for token - ${token} with tradeNumber- ${tradeNumber} & status: ${status}`,
        );
      }
    } catch (err) {
      this.logger.error(
        `Unable to update order for token - ${token} with tradeNumber- ${tradeNumber} & status: ${status}`,
        err,
      );
    }
  }

  /**
   * Finds a position by symbol and type, and updates its properties.
   * @param symb The symbol of the position to update.
   * @param type The type of the position to update.
   * @param updateData The data to update in the position.
   * @returns The updated position if found and updated, otherwise null.
   */
  async updatePosition(
    symb: string,
    type: number,
    updateData: Position,
  ): Promise<Position> {
    // Set updatedAt field
    updateData.updatedAt = new Date().toString();
    return await this.positionModel.findOneAndUpdate(
      { symb, type },
      {
        ...updateData,
        $setOnInsert: { createdAt: updateData.createdAt || new Date() },
      },
      { new: true, upsert: true },
    );
  }
}
