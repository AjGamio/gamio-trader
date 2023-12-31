import { TraderCommandType } from '../enums';
import { ITcpCommand } from '../interfaces/iCommand';
import { ResponseEventArgs } from '../processors/response.event.args';
import { ResponseProcessor } from '../processors/response.processor';
import { BaseTcpCommand } from './base.command';

export class POSRefreshCommand extends BaseTcpCommand {
  Result: any;
  constructor() {
    super(TraderCommandType.POSREFRESH_COMMAND);
  }

  static get Instance(): ITcpCommand {
    return new POSRefreshCommand();
  }

  Subscribe(processor: ResponseProcessor): void {
    processor.POSRefreshResponse.on(
      TraderCommandType.POSREFRESH_COMMAND,
      this.responseProcessorOrderServerStatusResponse,
    );
  }
  Unsubscribe(processor: ResponseProcessor): void {
    processor.POSRefreshResponse.off(
      TraderCommandType.POSREFRESH_COMMAND,
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
