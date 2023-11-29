import * as net from 'net';
import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { EventEmitter } from 'events';
import { ITcpCommand } from '../interfaces/iCommand';
import { ResponseProcessor } from '../processors/response.processor';

interface ICommandResult {
  Message: string;
  Success: boolean;
}

class CommandResult implements ICommandResult {
  Message: string = '';
  Success: boolean = false;

  static get SuccessResult(): ICommandResult {
    return { Message: '', Success: true };
  }
}

@Injectable()
export class TraderClient extends EventEmitter implements OnModuleDestroy {
  private readonly defaultTimeOutInSeconds = 1;
  private readonly _cancellationToken: any = {};
  private readonly _ipEndPoint: net.AddressInfo;
  private readonly _responseProcessor: ResponseProcessor;
  private readonly _tcpClient: net.Socket;
  private _currentStream: net.Socket | null = null;
  private _timeOut: Date;

  constructor(ipAddress: string, port: number, timeOut?: number) {
    super();
    this._timeOut = new Date(
      Date.now() + (timeOut || this.defaultTimeOutInSeconds) * 1000,
    );
    this._ipEndPoint = { address: ipAddress, port: port, family: 'ipv4' };
    this._tcpClient = new net.Socket();
    this._responseProcessor = new ResponseProcessor(this._cancellationToken);
  }

  async connectAsync(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this._tcpClient.connect(
        this._ipEndPoint.port,
        this._ipEndPoint.address,
        () => {
          console.log('Connected to the server');
          this._responseProcessor.listenAsync(this.getStream());
          resolve();
        },
      );

      this._tcpClient.on('error', (err) => {
        console.error('Error:', err.message);
        reject(err);
      });
    });
  }

  getStream(): net.Socket {
    return this._currentStream || (this._currentStream = this._tcpClient);
  }

  async sendCommandAsync(command: ITcpCommand): Promise<ICommandResult> {
    let result: ICommandResult | null = null;

    const commandText = command.ToString();
    const buffer = command.ToByteArray(commandText);

    console.log(` ${new Date().toUTCString()}|>>| ${commandText}`);

    try {
      if (command.WaitForResult) command.Subscribe(this._responseProcessor);
      this.getStream().write(buffer);

      if (command.WaitForResult) {
        while (!command.HasResult) {
          if (Date.now() > this._timeOut.getTime()) {
            throw new Error(
              `Timeout occurred. Command ${command.Name}. Timeout Duration(s): ${this.defaultTimeOutInSeconds})}`,
            );
          }
        }

        result = new CommandResult();
        result.Message = command.Result?.Message || '';
        result.Success = command.Result?.Success || true;
      } else {
        result = CommandResult.SuccessResult;
      }
    } catch (e) {
      console.error(e);
      result = new CommandResult();
      result.Message = e.message;
      result.Success = false;
    } finally {
      command.Unsubscribe(this._responseProcessor);
    }

    return result || CommandResult.SuccessResult;
  }

  onModuleDestroy() {
    this.dispose();
  }

  public dispose(force?: boolean) {
    if (
      (this._currentStream && this._currentStream.eventNames().length === 0) ||
      force
    ) {
      console.debug('closing connection');
      this._currentStream.destroy();
      this._currentStream = null;
    } else {
      console.log('can not close connection, there are active events in queue');
    }
  }
}
