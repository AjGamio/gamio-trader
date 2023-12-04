import { TraderCommandType } from '../enums';
import { ITcpCommand } from '../interfaces/iCommand';
import { ResponseEventArgs } from '../processors/response.event.args';
import { ResponseProcessor } from '../processors/response.processor';
import { BaseTcpCommand } from './base.command';

export class ClientCommand extends BaseTcpCommand {
  Result: any;
  constructor() {
    super(TraderCommandType.CLIENT_COMMAND, true);
  }

  static get Instance(): ITcpCommand {
    return new ClientCommand();
  }

  Subscribe(processor: ResponseProcessor): void {
    processor.ClientResponse.on(
      TraderCommandType.CLIENT_COMMAND,
      this.responseProcessorOrderServerStatusResponse,
    );
  }
  Unsubscribe(processor: ResponseProcessor): void {
    processor.ClientResponse.off(
      TraderCommandType.CLIENT_COMMAND,
      this.responseProcessorOrderServerStatusResponse,
    );
  }

  private responseProcessorOrderServerStatusResponse(
    e: ResponseEventArgs,
  ): void {
    this.Result = e.data;
    this.hasResult = true;
  }
}
