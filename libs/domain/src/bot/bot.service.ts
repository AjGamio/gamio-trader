import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BotModel } from './bot.model';
import CreateTradeBotDto from './dtos/create-bot.dto';
import UpdateTradeBotDto from './dtos/update-bot.dto';

@Injectable()
export class BotService {
  constructor(
    @InjectModel(BotModel.name) private tradeBotModel: Model<BotModel>,
  ) {}

  async create(createTradeBotDto: CreateTradeBotDto): Promise<BotModel> {
    const createdTradeBot = new this.tradeBotModel(createTradeBotDto);
    return createdTradeBot.save();
  }

  async findAll(): Promise<BotModel[]> {
    return this.tradeBotModel.find().exec();
  }

  async findOne(id: string): Promise<BotModel> {
    const tradeBot = await this.tradeBotModel.findById(id).exec();
    if (!tradeBot) {
      throw new NotFoundException(`TradeBot with ID ${id} not found`);
    }
    return tradeBot;
  }

  async update(
    id: string,
    updateTradeBotDto: UpdateTradeBotDto,
  ): Promise<BotModel> {
    const updatedTradeBot = await this.tradeBotModel
      .findByIdAndUpdate(id, updateTradeBotDto, {
        new: true,
      })
      .exec();
    if (!updatedTradeBot) {
      throw new NotFoundException(`TradeBot with ID ${id} not found`);
    }
    return updatedTradeBot;
  }

  async remove(id: string): Promise<any> {
    const deletedTradeBot = await this.tradeBotModel
      .deleteOne({ _id: id })
      .exec();
    if (!deletedTradeBot) {
      throw new NotFoundException(`TradeBot with ID ${id} not found`);
    }
    return deletedTradeBot;
  }
}
