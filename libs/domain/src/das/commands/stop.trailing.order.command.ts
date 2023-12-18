import { OrderAction } from '../enums';
import { BaseNewOrderCommand } from './new.oder.command';

/**
 * Stop Trailing: NEWORDER token b/s symbol route share STOPTRAILING TrailPrice
 * Example: NEWORDER 6 S MSFT SMAT 100 STOPTRAILING 0.2
 */
export class StopTrailingOrderCommand extends BaseNewOrderCommand {
  constructor(
    token: string,
    action: OrderAction,
    symbol: string,
    route: string,
    share: string,
    trailPrice: string,
  ) {
    super(token, action, symbol, route, share, 'STOPTRAILING', trailPrice);
  }
}
