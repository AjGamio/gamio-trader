import { TraderCommandType } from '../enums';
import { ITcpCommand } from '../interfaces/iCommand';
import { BaseTcpCommand } from './base.command';

export class BuyInCommand extends BaseTcpCommand {
  public override Subscribe(responseProcessor: any): void {
    responseProcessor.buyInResponse +=
      this.responseProcessorBuyInResponse.bind(this);
  }
  public override Unsubscribe(responseProcessor: any): void {
    responseProcessor.buyInResponse -=
      this.responseProcessorBuyInResponse.bind(this);
  }

  Result: any;
  constructor() {
    super(TraderCommandType.GET_BUYING_POWER_COMMAND);
  }

  static get Instance(): ITcpCommand {
    return new BuyInCommand();
  }

  private responseProcessorBuyInResponse(sender: any, e: any): void {
    this.Result =
      e.parameters?.length === 1 ? e.parameters[0] : e.message || '';
    this.hasResult = true;
  }
}
