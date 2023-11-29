import { TraderCommandType } from '../enums';
import { ITcpCommand } from '../interfaces/iCommand';
import { BaseTcpCommand } from './base.command';

export class EchoCommand extends BaseTcpCommand {
  public override Subscribe(responseProcessor: any): void {
    responseProcessor.echoResponse +=
      this.responseProcessorEchoResponse.bind(this);
  }
  public override Unsubscribe(responseProcessor: any): void {
    responseProcessor.echoResponse -=
      this.responseProcessorEchoResponse.bind(this);
  }

  Result: any;
  constructor() {
    super(TraderCommandType.ECHO_COMMAND);
  }

  static get Instance(): ITcpCommand {
    return new EchoCommand();
  }

  private responseProcessorEchoResponse(sender: any, e: any): void {
    this.Result =
      e.parameters?.length === 1 ? e.parameters[0] : e.message || '';
    this.hasResult = true;
  }
}
