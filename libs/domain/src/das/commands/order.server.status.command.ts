import { TraderCommandType } from '../enums';
import { ITcpCommand } from '../interfaces/iCommand';
import { BaseTcpCommand } from './base.command';

export class OrderServerStatusCommand extends BaseTcpCommand {
  public override Subscribe(responseProcessor: any): void {
    responseProcessor.orderServerStatusResponse +=
      this.responseProcessorOrderServerStatusResponse.bind(this);
  }
  public override Unsubscribe(responseProcessor: any): void {
    responseProcessor.orderServerStatusResponse -=
      this.responseProcessorOrderServerStatusResponse.bind(this);
  }

  Result: any;
  constructor() {
    super(TraderCommandType.ORDER_SERVER_CONNECTION_STATUS_COMMAND);
  }

  static get Instance(): ITcpCommand {
    return new OrderServerStatusCommand();
  }

  private responseProcessorOrderServerStatusResponse(
    sender: any,
    e: any,
  ): void {
    this.Result =
      e.parameters?.length === 1 ? e.parameters[0] : e.message || '';
    this.hasResult = true;
  }
}
