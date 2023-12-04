import { ICommandResult } from '../interfaces/iCommand.result';

export class CommandResult implements ICommandResult {
  Message: string = '';
  Success: boolean = false;

  static get SuccessResult(): ICommandResult {
    return { Message: '', Success: true };
  }
}
