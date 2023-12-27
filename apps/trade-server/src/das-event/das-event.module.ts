import { Module } from '@nestjs/common';
import { DasGateway } from './das.gateway';
import { DomainModule } from 'gamio/domain';
import { SchedulerModule } from 'gamio/domain/scheduler/scheduler.module';

/**
 * Module for handling DAS (Direct Access Service) events.
 * Integrates with the DomainModule and SchedulerModule.
 */
@Module({
  imports: [
    // Include the DomainModule for domain-related functionality
    DomainModule,
    // Include the SchedulerModule for scheduling tasks
    SchedulerModule,
  ],
  providers: [
    // Provide the DasGateway as a provider for handling DAS events
    DasGateway,
  ],
  exports: [
    // Export DasGateway to make it accessible in other modules
    DasGateway,
  ],
})
export class DasEventModule {}
