import { OrderAction, OrderOptions, TimeInForce } from '../enums';
import { BaseNewOrderCommand } from './new.oder.command';

/**
 * Peg Order:
 * NEWORDER token b/s symbol route share PEG MID/AGG/PRIM/LAST(optional field) price(optional field)
 * Example:
 * NEWORDER 3 B MSFT INET 100 PEG MID 200.5 TIF=GTC
 */
export class PegOrderCommand extends BaseNewOrderCommand {
  constructor(
    token: string,
    action: OrderAction,
    symbol: string,
    route: string,
    share: string,
    orderOptions: OrderOptions | undefined,
    price: string | undefined,
    timeInForce: TimeInForce = TimeInForce.GTC,
  ) {
    super(
      token,
      action,
      symbol,
      route,
      share,
      'PEG',
      orderOptions?.toString() ?? '',
      price ?? '',
      timeInForce.toString(),
    );
  }
}
