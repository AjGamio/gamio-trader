import { Injectable, NotFoundException } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { TradeBot } from './tradeBot.entity';
import { TradeBotOrder } from './tradeBotOder.entity';

@Injectable()
export class TradeBotsService {
  constructor(
    @InjectModel(TradeBot.name) private readonly tradeBotModel: Model<TradeBot>,
    @InjectModel(TradeBotOrder.name)
    private readonly tradeBotOrderModel: Model<TradeBotOrder>,
  ) {}

  async findAll(): Promise<TradeBot[]> {
    return this.tradeBotModel.find().exec();
  }

  async findAllOrders(): Promise<TradeBotOrder[]> {
    return this.tradeBotOrderModel.find().exec();
  }

  async findById(id: string): Promise<TradeBot> {
    const tradeBot = await this.tradeBotModel.findById(id).exec();
    if (!tradeBot) {
      throw new NotFoundException(`TradeBot with ID ${id} not found`);
    }
    return tradeBot;
  }

  async create(createTradeBotDto: TradeBot): Promise<TradeBot> {
    const botCount = await this.tradeBotModel.countDocuments();
    let createdTradeBot = new this.tradeBotModel(createTradeBotDto);
    createdTradeBot = Object.assign(createdTradeBot, createTradeBotDto);
    createdTradeBot = Object.assign(createdTradeBot, {
      updatedAt: new Date(),
      createdAt: new Date(),
      name: `bot-${Number(botCount) + 1}`,
    });
    await this.tradeBotModel.collection.insertOne(createdTradeBot, {});
    return createdTradeBot;
  }

  async update(id: string, updateTradeBotDto: TradeBot): Promise<TradeBot> {
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
}
