import { TraderCommandType } from '../enums';
import { ITcpCommand } from '../interfaces/iCommand';
import { BaseTcpCommand } from './base.command';

export class LogoutCommand extends BaseTcpCommand {
  public override Subscribe(responseProcessor: any): void {
    responseProcessor.logoutResponse +=
      this.responseProcessorLogoutResponse.bind(this);
  }
  public override Unsubscribe(responseProcessor: any): void {
    responseProcessor.logoutResponse -=
      this.responseProcessorLogoutResponse.bind(this);
  }

  Result: any;
  constructor() {
    super(TraderCommandType.QUIT_COMMAND);
  }

  static get Instance(): ITcpCommand {
    return new LogoutCommand();
  }

  private responseProcessorLogoutResponse(sender: any, e: any): void {
    this.Result =
      e.parameters?.length === 1 ? e.parameters[0] : e.message || '';
    this.hasResult = true;
  }
}
