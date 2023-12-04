import { Module } from '@nestjs/common';
import { TraderClientController } from './trader-client.controller';
import { TraderClientService } from './trader-client.service';

@Module({
  imports: [],
  controllers: [TraderClientController],
  providers: [TraderClientService],
})
export class TraderClientModule {}
