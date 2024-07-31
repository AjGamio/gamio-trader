import { Injectable, OnModuleInit } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { DasGateway } from '../das-event/das.gateway';
import { EnvConfig } from 'gamio/domain/config/env.config';

@Injectable()
export class SubscriberService implements OnModuleInit {
  /**
   *
   */
  constructor(private readonly webSocketGateway: DasGateway) {}

  onModuleInit() {
    console.log('SubscriberService initialized');
  }

  @EventPattern(EnvConfig.REDIS.CHANNELS.DAS_TASK_SCHEDULER)
  async handleDASTaskSchedulerEvent(@Payload() data: any) {
    console.log('Received data:', data);
  }

  @EventPattern(EnvConfig.REDIS.CHANNELS.DAS_WORKER)
  async handleDASWorkerEvent(@Payload() data: any) {
    console.log('Received data:', data);
  }
}
