import { Controller, Get } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger'; // Import Swagger decorators
import { AppService } from './app.service';
import { DasGateway } from './das-event/das.gateway';

@ApiTags('App') // Swagger tag for grouping related endpoints
@Controller()
export class AppController {
  constructor(
    private readonly webSocketGateway: DasGateway,
    private readonly appService: AppService,
  ) {}

  /**
   * @summary Get a greeting message
   * @returns {string} The greeting message
   */
  @Get()
  @ApiResponse({ status: 200, description: 'Returns the greeting message' })
  getHello(): string {
    // Emit a WebSocket event
    this.webSocketGateway.server.emit('events', {
      message: 'Hello from WebSocket!',
    });

    // Return the greeting message from the service
    return this.appService.getHello();
  }
}
