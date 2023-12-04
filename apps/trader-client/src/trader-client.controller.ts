import { Controller, Get } from '@nestjs/common';
import { TraderClientService } from './trader-client.service';

@Controller()
export class TraderClientController {
  constructor(private readonly traderClientService: TraderClientService) {}

  @Get()
  getHello(): string {
    return this.traderClientService.getHello();
  }
}
