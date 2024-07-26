import { IsString, IsDateString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import {
  ParametersType,
  OrderOptions,
  BotUserCredentials,
} from '../nested.bot.classes';

class CreateTradeBotDto {
  @IsString()
  name: string;

  @IsDateString()
  updatedAt?: string;

  @IsDateString()
  createdAt?: string;

  @ValidateNested()
  @Type(() => ParametersType)
  parameters: {
    RTH: ParametersType;
    ATH: ParametersType;
  };

  @ValidateNested()
  @Type(() => OrderOptions)
  order: {
    RTH: OrderOptions;
    ATH: OrderOptions;
    profitPercent: number;
    stopLossPercent: number;
    timeLimitStop: { duration: number; enabled: boolean };
    timeLimitStopBeforeClose: { duration: number; enabled: boolean };
  };

  @ValidateNested()
  @Type(() => BotUserCredentials)
  credential: BotUserCredentials;
}

export default CreateTradeBotDto;
