import { TraderCommandType } from '../enums';
import { ResponseProcessor } from '../processors/response.processor';

export interface ITcpCommand {
  Type: TraderCommandType;
  Name: string;
  Params: string[];
  ToByteArray(command?: string | null): Uint8Array;
  ToString(): string;
  WaitForResult: boolean;
  HasResult: boolean;
  Result: any | null;
  Subscribe(processor: ResponseProcessor): void;
  Unsubscribe(processor: ResponseProcessor): void;
}
