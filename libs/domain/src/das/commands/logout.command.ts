import { TraderCommandType } from '../enums';
import { ITcpCommand } from '../interfaces/iCommand';
import { ResponseEventArgs } from '../processors/response.event.args';
import { ResponseProcessor } from '../processors/response.processor';
import { BaseTcpCommand } from './base.command';

export class LogoutCommand extends BaseTcpCommand {
  Result: any;
  constructor() {
    super(TraderCommandType.QUIT_COMMAND, true);
  }

  static get Instance(): ITcpCommand {
    return new LogoutCommand();
  }

  Subscribe(processor: ResponseProcessor): void {
    processor.LogoutResponse.on(
      TraderCommandType.QUIT_COMMAND,
      this.responseProcessorOrderServerStatusResponse,
    );
  }
  Unsubscribe(processor: ResponseProcessor): void {
    processor.LogoutResponse.off(
      TraderCommandType.QUIT_COMMAND,
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
