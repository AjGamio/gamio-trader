import { PartialType } from '@nestjs/mapped-types';
import CreateTradeBotDto from './create-bot.dto';

class UpdateTradeBotDto extends PartialType(CreateTradeBotDto) {}

export default UpdateTradeBotDto;
