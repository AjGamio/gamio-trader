import { TraderCommandType } from '../enums';

export interface ITcpCommand {
  Type: TraderCommandType;
  Name: string;
  Params: string[];
  ToByteArray(command?: string | null): Uint8Array;
  ToString(): string;
  WaitForResult: boolean;
  HasResult: boolean;
  Result: any | null;
  Subscribe(responseProcessor: any): void;
  Unsubscribe(responseProcessor: any): void;
}
