import { TraderCommandType } from '../enums';
// import { ResponseProcessor, ResponseEventArgs } from 'DAS.Trader.IntegrationClient.Response';
import { BaseTcpCommand } from './base.command';

export class LoginCommand extends BaseTcpCommand {
  Result: any;
  constructor(login: string, password: string, account: string) {
    super(
      TraderCommandType.LOGIN_COMMAND,
      true,
      false,
      login,
      password,
      account,
    );
  }

  public override Subscribe(responseProcessor: any): void {
    responseProcessor.loginResponse +=
      this.responseProcessorLoginResponse.bind(this);
  }

  private responseProcessorLoginResponse(sender: any, e: any): void {
    this.Result =
      e.parameters?.length === 1 ? e.parameters[0] : e.message || '';
    this.hasResult = true;
  }

  public override Unsubscribe(responseProcessor: any): void {
    responseProcessor.loginResponse -=
      this.responseProcessorLoginResponse.bind(this);
  }
}
