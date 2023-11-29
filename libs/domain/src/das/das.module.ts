import { Module } from '@nestjs/common';
import { DasService } from './das.service';

@Module({
  providers: [DasService],
  exports: [DasService],
})
export class DasModule {}
