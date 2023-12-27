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
