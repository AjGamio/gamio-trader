import { Module } from '@nestjs/common';
import { DomainService } from './domain.service';
import { TradeService } from './trade/trade.service';
import { SchedulerModule } from './scheduler/scheduler.module';

@Module({
  imports: [SchedulerModule],
  providers: [DomainService, TradeService],
  exports: [DomainService],
})
export class DomainModule {}
