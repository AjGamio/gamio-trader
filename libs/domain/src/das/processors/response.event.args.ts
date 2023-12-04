import { processSocketData } from '../common/data.helper';
import { TraderCommandType } from '../enums';
import { v4 as uuidv4 } from 'uuid';
import { JsonData } from '../interfaces/iData';

export class ResponseEventArgs {
  public readonly correlationId: any;
  public readonly data: JsonData;
  constructor(
    public commandType: TraderCommandType,
    public message: string | null = null,
    // public parameters: string[] | null = null,
  ) {
    this.correlationId = uuidv4();
    this.data = processSocketData(this.message);
  }
}
