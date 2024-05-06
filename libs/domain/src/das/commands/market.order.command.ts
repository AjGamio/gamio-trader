import {
  OrderAction,
  TimeInForce,
} from '../enums';
import { BaseNewOrderCommand } from './new.oder.command';

/**
 * Market order:
 * NEWORDER token b/s symbol route share MKT
 * Example:
 * NEWORDER 2 S MSFT SMAT 100 MKT TIF = DAY
 */
export class MarketOrderCommand extends BaseNewOrderCommand {
  constructor(
    token: string,
    action: OrderAction,
    symbol: string,
    route: string,
    share: string,
    timeInForce: TimeInForce = TimeInForce.Day,
    ...parameters: string[]
  ) {
    super(
      token,
      action,
      symbol,
      route,
      share,
      'MKT',
      timeInForce.toString(),
      ...parameters,
    );
  }
}
