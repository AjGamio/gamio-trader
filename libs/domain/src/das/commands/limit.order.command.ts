import { OrderAction, TimeInForce } from '../enums';
import { BaseNewOrderCommand } from './new.oder.command';

/**
 * Limit order:
 * NEWORDER token b/s symbol route share price
 * Example:
 * NEWORDER 1 B MSFT ARCA 100 200.5 TIF=DAY+
 */
export class LimitOrderCommand extends BaseNewOrderCommand {
  constructor(
    token: string,
    action: OrderAction,
    symbol: string,
    route: string,
    share: string,
    price: string,
    timeInForce: TimeInForce = TimeInForce.DayPlus,
  ) {
    super(token, action, symbol, route, share, price, timeInForce.toString());
  }
}
