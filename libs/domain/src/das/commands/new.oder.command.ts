import { OrderAction, TraderCommandType } from '../enums';
import { BaseTcpCommand } from './base.command';
import { ResponseProcessor } from '../processors/response.processor';
import { ResponseEventArgs } from '../processors/response.event.args';

export abstract class BaseNewOrderCommand extends BaseTcpCommand {
  Result: any;
  constructor(
    token: string,
    action: OrderAction,
    symbol: string,
    ...parameters: string[]
  ) {
    super(
      TraderCommandType.NEWORDER_COMMAND,
      false,
      false,
      token,
      action.toString(),
      symbol,
      ...parameters,
    );
  }

  Subscribe(processor: ResponseProcessor): void {
    processor.NewOrderResponse.on(
      TraderCommandType.NEWORDER_COMMAND,
      this.responseProcessorOrderServerStatusResponse,
    );
  }
  Unsubscribe(processor: ResponseProcessor): void {
    processor.NewOrderResponse.off(
      TraderCommandType.NEWORDER_COMMAND,
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
