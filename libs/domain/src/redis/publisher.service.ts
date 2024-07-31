import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class PublisherService {
  constructor(@Inject('REDIS_SERVICE') private readonly client: ClientProxy) {}

  async publish(channel: string, message: any) {
    await this.client.emit(channel, message).toPromise();
  }
}
