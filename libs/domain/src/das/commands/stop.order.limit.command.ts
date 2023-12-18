import { OrderAction, TimeInForce } from '../enums';
import { BaseNewOrderCommand } from './new.oder.command';

/**
 * Stop Limit: NEWORDER token b/s symbol route share STOPLMT StopPrice Price
 * Example: NEWORDER 5 B MSFT SMAT 100 STOPLMT 210.5 210.8 TIF=DAY
 */
export class StopLimitOrderCommand extends BaseNewOrderCommand {
  constructor(
    token: string,
    action: OrderAction,
    symbol: string,
    route: string,
    share: string,
    stopPrice: string,
    price: string,
    timeInForce: TimeInForce = TimeInForce.Day,
  ) {
    super(
      token,
      action,
      symbol,
      route,
      share,
      'STOPLMT',
      stopPrice,
      price,
      timeInForce.toString(),
    );
  }
}
