import { Socket } from 'net';
import { EventEmitter } from 'stream';
import { Logger } from '@nestjs/common';
import { ITcpCommand } from '../interfaces/iCommand';
import { ResponseEventArgs } from './response.event.args';
import { GenericEventEmitter } from './event.processor';
import { TraderCommandType } from '../enums';
import { EnvConfig } from 'apps/trade-server/src/config/env.config';
import { CommandData } from '../interfaces/iData';

class ResponseProcessor extends EventEmitter {
  private readonly logger: Logger;
  private readonly command: ITcpCommand;

  public readonly LoginResponse: GenericEventEmitter<
    ResponseEventArgs,
    TraderCommandType.LOGIN_COMMAND
  > = new EventEmitter();
  public readonly LogoutResponse: GenericEventEmitter<
    ResponseEventArgs,
    TraderCommandType.QUIT_COMMAND
  > = new EventEmitter();
  public readonly ClientResponse: GenericEventEmitter<
    ResponseEventArgs,
    TraderCommandType.CLIENT_COMMAND
  > = new EventEmitter();
  public readonly EchoResponse: GenericEventEmitter<
    ResponseEventArgs,
    TraderCommandType.ECHO_COMMAND
  > = new EventEmitter();
  public readonly BuyingPowerResponse: GenericEventEmitter<
    ResponseEventArgs,
    TraderCommandType.GET_BUYING_POWER_COMMAND
  > = new EventEmitter();

  constructor() {
    super();
    this.logger = new Logger(this.constructor.name);
  }

  async listenAsync(
    stream: Socket,
    commandType: TraderCommandType,
  ): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const onData = (data: Buffer) => {
        const receivedData = data.toString();
        if (EnvConfig.ENABLE_DEBUG) {
          this.logger.log(
            `commandType: ${commandType}, receivedData:${receivedData}`,
          );
        }

        // Emit events based on command type
        this.emitEvent(
          commandType,
          new ResponseEventArgs(commandType, receivedData),
        );
      };

      const onError = (err: Error) => {
        console.error('Error:', err.message);
        reject(err);
        this.stopListening();
      };

      const onClose = () => {
        console.log('Connection closed');
        this.stopListening();
        resolve();
      };

      // Attach event listeners
      stream.on('data', onData);
      stream.on('error', onError);
      stream.on('close', onClose);
    });
  }

  private emitEvent(commandType: TraderCommandType, data: ResponseEventArgs) {
    const formattedData: CommandData = {
      commandType: commandType,
      dataId: data.correlationId,
      data: data.data,
    };
    // this.logger.log(formattedData);
    this.logger.verbose(`Emitting data for command:${data.commandType}`);
    this.emit(commandType.toString(), formattedData);
  }

  private stopListening() {
    // Implement cleanup logic or additional actions when stopping listening
    this.logger.verbose('Stopping listening');
  }
}

export { ResponseProcessor };
