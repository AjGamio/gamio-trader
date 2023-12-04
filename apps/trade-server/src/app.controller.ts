import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { DasGateway } from './das-event/das.gateway';

@Controller()
export class AppController {
  constructor(
    private readonly webSocketGateway: DasGateway,
    private readonly appService: AppService,
  ) {}

  @Get()
  getHello(): string {
    this.webSocketGateway.server.emit('events', {
      message: 'Hello from WebSocket!',
    });
    return this.appService.getHello();
  }
}
