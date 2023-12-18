import { TraderCommandType } from '../enums';
import { ITcpCommand } from '../interfaces/iCommand';
import { ResponseEventArgs } from '../processors/response.event.args';
import { ResponseProcessor } from '../processors/response.processor';
import { BaseTcpCommand } from './base.command';

export class BuyInCommand extends BaseTcpCommand {
  Result: any;
  constructor() {
    super(TraderCommandType.GET_BUYING_POWER_COMMAND);
  }

  static get Instance(): ITcpCommand {
    return new BuyInCommand();
  }

  Subscribe(processor: ResponseProcessor): void {
    processor.BuyingPowerResponse.on(
      TraderCommandType.GET_BUYING_POWER_COMMAND,
      this.responseProcessorOrderServerStatusResponse,
    );
  }

  Unsubscribe(processor: ResponseProcessor): void {
    processor.BuyingPowerResponse.off(
      TraderCommandType.GET_BUYING_POWER_COMMAND,
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
