// import { TraderCommandType } from '../enums';
// import { ITcpCommand } from '../interfaces/iCommand';
// import { ResponseEventArgs } from '../processors/response.event.args';
// import { ResponseProcessor } from '../processors/response.processor';
// import { BaseTcpCommand } from './base.command';

// export class OrderServerStatusCommand extends BaseTcpCommand {
//   Result: any;
//   constructor() {
//     super(TraderCommandType.ORDER_SERVER_CONNECTION_STATUS_COMMAND);
//   }

//   static get Instance(): ITcpCommand {
//     return new OrderServerStatusCommand();
//   }

//   Subscribe(processor: ResponseProcessor): void {
//     processor.LoginResponse.on(
//       TraderCommandType.LOGIN_RESPONSE,
//       this.responseProcessorOrderServerStatusResponse,
//     );
//   }
//   Unsubscribe(processor: ResponseProcessor): void {
//     processor.LoginResponse.off(
//       'LoginResponse',
//       this.responseProcessorOrderServerStatusResponse,
//     );
//   }

//   private responseProcessorOrderServerStatusResponse(
//     e: ResponseEventArgs,
//   ): void {
//     this.Result =
//       e.parameters?.length === 1 ? e.parameters[0] : e.message || '';
//     this.hasResult = true;
//   }
// }
