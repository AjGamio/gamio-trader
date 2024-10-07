import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { EnvConfig } from 'gamio/domain/config/env.config';
import { RedisService } from './redis.service';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'REDIS_SERVICE',
        transport: Transport.REDIS,
        options: {
          host: EnvConfig.REDIS.HOST,
          port: EnvConfig.REDIS.PORT,
          username: EnvConfig.REDIS.USERNAME,
          password: EnvConfig.REDIS.PASSWORD,
        },
      },
    ]),
  ],
  providers:[RedisService],
  exports: [ClientsModule, RedisService],
})
export class RedisModule {}
