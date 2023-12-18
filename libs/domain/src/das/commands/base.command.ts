import { EnumHelper } from '../common';
import { TraderCommandType } from '../enums';
import { ITcpCommand } from '../interfaces/iCommand';
import { ResponseProcessor } from '../processors/response.processor';

export abstract class BaseTcpCommand implements ITcpCommand {
  constructor(
    protected type: TraderCommandType,
    protected waitForResult: boolean = false,
    protected hasResult: boolean = false,
    ...params: [string, string, string, ...string[]] | string[]
  ) {
    this.name = EnumHelper.getEnumDescription(type);
    this.params = params;
  }
  abstract Subscribe(processor: ResponseProcessor): void;
  abstract Unsubscribe(processor: ResponseProcessor): void;

  abstract Result: any | null;

  get Type(): TraderCommandType {
    return this.type;
  }

  get Name(): string {
    return this.name;
  }

  get Params(): string[] {
    return this.params;
  }

  ToByteArray(command?: string | null): Uint8Array {
    const buffer = new TextEncoder().encode(command ?? this.toString());
    return new Uint8Array(buffer);
  }

  ToString(): string {
    const sb: string[] = [];

    sb.push(this.name);

    for (const param of this.params) {
      if (param.trim() !== '') {
        sb.push(` ${param}`);
      }
    }

    sb.push('\r\n');

    return sb.join('');
  }

  get WaitForResult(): boolean {
    return this.waitForResult;
  }

  get HasResult(): boolean {
    return this.hasResult;
  }

  private name: string;
  private params: string[];
}
