import { Injectable, Logger } from '@nestjs/common';
import { createClient, RedisClientType } from 'redis';
import { BotEventData, DASEventData } from '../das/interfaces/iEventData';
import { EnvConfig } from '../config/env.config';

@Injectable()
export class RedisService {
  private readonly subscriber: RedisClientType;
  private logger = new Logger(RedisService.name);
  constructor() {
    this.subscriber = createClient({ url: EnvConfig.REDIS.URL });
    this.subscriber.connect();

    this.subscriber.on('error', (err) =>
      this.logger.error('Redis Client Error', err),
    );
  }

  async subscribe(
    channel: string,
    callback: (message: DASEventData | BotEventData) => void,
  ): Promise<void> {
    this.subscriber.subscribe(channel, (message) => {
      const formattedMessage =
        channel === EnvConfig.REDIS.CHANNELS.DAS_WORKER
          ? (JSON.parse(message) as DASEventData)
          : EnvConfig.REDIS.CHANNELS.DAS_BOT_EVENT_CHANNEL
            ? (JSON.parse(message) as BotEventData)
            : (JSON.parse(message) as any);
      formattedMessage.Channel = channel;
      formattedMessage.TimeStamp = new Date();
      callback(formattedMessage);
    });
  }
}
