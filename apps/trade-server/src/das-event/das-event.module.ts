import { Module } from '@nestjs/common';
import { DasGateway } from './das.gateway';
import { DomainModule } from 'gamio/domain';
import { SchedulerModule } from 'gamio/domain/scheduler/scheduler.module';

@Module({
  imports: [DomainModule, SchedulerModule],
  providers: [DasGateway],
  exports: [DasGateway],
})
export class DasEventModule {}
