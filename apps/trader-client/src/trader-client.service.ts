import { Injectable } from '@nestjs/common';

@Injectable()
export class TraderClientService {
  getHello(): string {
    return 'Hello World!';
  }
}
