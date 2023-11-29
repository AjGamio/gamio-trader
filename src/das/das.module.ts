// src/das/das.module.ts
import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { DASController } from './das.controller';
import { DasService } from 'gamio/domain/das/das.service';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'DAS_SERVICE',
        transport: Transport.TCP,
        options: {
          port: 3001, // Change this port as needed
        },
      },
    ]),
  ],
  providers: [DasService],
  controllers: [DASController],
})
export class DasModule {}
