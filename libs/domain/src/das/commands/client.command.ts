import { TraderCommandType } from '../enums';
import { ITcpCommand } from '../interfaces/iCommand';
import { BaseTcpCommand } from './base.command';

export class ClientCommand extends BaseTcpCommand {
  public override Subscribe(responseProcessor: any): void {
    responseProcessor.clientResponse +=
      this.responseProcessorClientResponse.bind(this);
  }
  public override Unsubscribe(responseProcessor: any): void {
    responseProcessor.clientResponse -=
      this.responseProcessorClientResponse.bind(this);
  }

  Result: any;
  constructor() {
    super(TraderCommandType.CLIENT_COMMAND);
  }

  static get Instance(): ITcpCommand {
    return new ClientCommand();
  }

  private responseProcessorClientResponse(sender: any, e: any): void {
    this.Result =
      e.parameters?.length === 1 ? e.parameters[0] : e.message || '';
    this.hasResult = true;
  }
}
