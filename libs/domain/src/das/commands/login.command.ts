import { Logger } from '@nestjs/common';
import { TraderCommandType } from '../enums';
import { ResponseProcessor } from '../processors/response.processor';
import { BaseTcpCommand } from './base.command';
import { ResponseEventArgs } from '../processors/response.event.args';

export class LoginCommand extends BaseTcpCommand {
  Result: any;
  private readonly logger: Logger;
  constructor(login: string, password: string, account: string) {
    super(
      TraderCommandType.LOGIN_COMMAND,
      true,
      false,
      login,
      password,
      account,
    );
    this.logger = new Logger(this.constructor.name);
  }

  Subscribe(processor: ResponseProcessor): void {
    processor.LoginResponse.on(
      TraderCommandType.LOGIN_COMMAND,
      this.responseProcessorOrderServerStatusResponse,
    );
  }
  Unsubscribe(processor: ResponseProcessor): void {
    processor.LoginResponse.off(
      TraderCommandType.LOGIN_COMMAND,
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
