// src/das/das.module.ts
import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { DASController } from './das.controller';
import { DasEventModule } from '../das-event/das-event.module';
import { EnvConfig } from '../config/env.config';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'DAS_SERVICE',
        transport: Transport.TCP,
        options: {
          port: EnvConfig.PORT, // Change this port as needed
        },
      },
    ]),
    DasEventModule,
  ],
  providers: [],
  controllers: [DASController],
})
export class DasModule {}
