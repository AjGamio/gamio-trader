import { Module } from '@nestjs/common';
import { DasGateway } from './das.gateway';
import { DasService } from 'gamio/domain/das/das.service';

@Module({
  providers: [DasGateway, DasService],
  exports: [DasGateway, DasService],
})
export class DasEventModule {}
