import { TraderCommandType } from '../enums';
import { ITcpCommand } from '../interfaces/iCommand';
import { ResponseEventArgs } from '../processors/response.event.args';
import { ResponseProcessor } from '../processors/response.processor';
import { BaseTcpCommand } from './base.command';

export class EchoCommand extends BaseTcpCommand {
  Result: any;
  constructor() {
    super(TraderCommandType.ECHO_COMMAND, true);
  }

  static get Instance(): ITcpCommand {
    return new EchoCommand();
  }

  Subscribe(processor: ResponseProcessor): void {
    processor.EchoResponse.on(
      TraderCommandType.ECHO_COMMAND,
      this.responseProcessorOrderServerStatusResponse,
    );
  }
  Unsubscribe(processor: ResponseProcessor): void {
    processor.EchoResponse.off(
      TraderCommandType.ECHO_COMMAND,
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
