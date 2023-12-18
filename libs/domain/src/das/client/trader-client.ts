import * as net from 'net';
import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { EventEmitter } from 'events';
import { ITcpCommand } from '../interfaces/iCommand';
import { ResponseProcessor } from '../processors/response.processor';
import { ICommandResult } from '../interfaces/iCommand.result';
import { CommandResult } from '../commands/command.result';
import { TraderCommandType } from '../enums';
import { TradeBotsService } from 'gamio/domain/trade-bot/tradebot.service';
import { LoginCommand } from '../commands';
import { LoginDto } from '../common';

@Injectable()
export class TraderClient extends EventEmitter implements OnModuleDestroy {
  private loginAttempted: boolean = false;
  private readonly defaultTimeOutInSeconds = 1;
  private isLoggedIn: boolean = false;
  private readonly _ipEndPoint: net.AddressInfo;
  private readonly _responseProcessor: ResponseProcessor;
  private readonly _tcpClient: net.Socket;
  private _currentStream: net.Socket | null = null;
  private _timeOut: Date;
  private logger: Logger;
  constructor(
    private readonly tradeBotService: TradeBotsService,
    private readonly loginDto: LoginDto,
    ipAddress: string,
    port: number,
    timeOut?: number,
  ) {
    super();
    this._timeOut = new Date(
      Date.now() + (timeOut || this.defaultTimeOutInSeconds) * 1000,
    );
    this._ipEndPoint = { address: ipAddress, port: port, family: 'ipv4' };
    this._tcpClient = new net.Socket();
    this._responseProcessor = new ResponseProcessor(this.tradeBotService);
    this.logger = new Logger(this.constructor.name);
  }

  async connectAsync(): Promise<void> {
    this.dispose();
    return new Promise<void>((resolve, reject) => {
      this._tcpClient.connect(
        this._ipEndPoint.port,
        this._ipEndPoint.address,
        () => {
          this.logger.log('Connecting to the server');
          const stream = this.getStream();
          this._responseProcessor.listenAsync(stream, TraderCommandType.None);
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
    this._responseProcessor.on(command.Type.toString(), async (data) => {
      // this.logger.debug(`Emitting data for command:${command.Type.toString()}`);
      if (data.isLoggedIn) {
        this.isLoggedIn = data.isLoggedIn;
      }
      if (!this.isLoggedIn && !this.loginAttempted) {
        this.loginAttempted = true;
        this.logger.warn(`trying DAS server login .... `);
        if (
          this.loginDto &&
          this.loginDto.username &&
          this.loginDto.password &&
          this.loginDto.account
        ) {
          await this.sendCommandAsync(
            new LoginCommand(
              this.loginDto.username,
              this.loginDto.password,
              this.loginDto.account,
            ),
          );
        } else {
          this.logger.warn(`DAS server login credentials not found`);
        }
      }
      // else if (this.loginAttempted) {
      // this.logger.warn(`DAS server logged in`);
      // }

      this.emit(command.Type.toString(), data);
    });
    const commandText = command.ToString();
    const buffer = command.ToByteArray(commandText);
    this.logger.log(` ${new Date().toUTCString()}|>>| ${commandText}`);
    try {
      this.logger.log(`Command:${commandText}`);
      const stream = this.getStream();
      this._responseProcessor.listenAsync(stream, command.Type);
      if (command.WaitForResult) command.Subscribe(this._responseProcessor);
      stream.write(buffer);

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
      this.logger.error(e);
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
      this.logger.verbose('closing connection');
      this._currentStream.destroy();
      this._currentStream = null;
    } else {
      this.logger.fatal(
        'can not close connection, there are active events in queue',
      );
    }
  }
}
