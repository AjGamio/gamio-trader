import { Injectable } from '@nestjs/common';

/**
 * Service for the main application logic.
 */
@Injectable()
export class AppService {
  /**
   * Get a greeting message.
   * @returns Greeting message
   */
  getHello(): string {
    return 'Hello World!';
  }
}

// import { Injectable, OnModuleInit } from '@nestjs/common';
// import { RedisService } from './redis/redis.service';
// import { EnvConfig } from 'gamio/domain/config/env.config';
// import { DasService } from 'gamio/domain/das/das.service';

// @Injectable()
// export class AppService implements OnModuleInit {
//   constructor(
//     private readonly redisService: RedisService,
//     private readonly dasService: DasService,
//   ) {}

//   async onModuleInit() {
//     await this.redisService.subscribe(
//       EnvConfig.REDIS.CHANNELS.DAS_WORKER,
//       (message: string) => {
//         console.log(`Received message: ${message}`);
//         this.dasService.client.emit(
//           EnvConfig.REDIS.CHANNELS.DAS_WORKER,
//           message,
//         );
//         // Handle the message as needed
//       },
//     );
//   }

//   getHello(): string {
//     return 'Hello World!';
//   }
// }
