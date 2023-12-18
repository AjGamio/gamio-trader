import { OrderAction, TimeInForce } from '../enums';
import { BaseNewOrderCommand } from './new.oder.command';

/**
 * Stop Market: NEWORDER token b/s symbol route share STOPMKT StopPrice
 * Example: NEWORDER 4 S MSFT SMAT 100 STOPMKT 210.5 TIF=DAY
 */
export class StopMarketOrderCommand extends BaseNewOrderCommand {
  constructor(
    token: string,
    action: OrderAction,
    symbol: string,
    route: string,
    share: string,
    stopPrice: string,
    timeInForce: TimeInForce = TimeInForce.Day,
  ) {
    super(
      token,
      action,
      symbol,
      route,
      share,
      'STOPMKT',
      stopPrice,
      timeInForce.toString(),
    );
  }
}
