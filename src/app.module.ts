import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DasModule } from './das/das.module';

@Module({
  imports: [DasModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
