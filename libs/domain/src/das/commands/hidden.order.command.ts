import { OrderAction } from '../enums';
import { BaseNewOrderCommand } from './new.oder.command';

/**
 * Hidden order:
 * NEWORDER token b/s symbol route share price Display = 0 / num
 * NEWORDER 1 B MSFT ARCA 300 200.5 GTC=DAY+ Display=0
 */
export class HiddenOrderCommand extends BaseNewOrderCommand {
  constructor(
    token: string,
    action: OrderAction,
    symbol: string,
    route: string,
    share: string,
    price: string,
    display: number = 0,
  ) {
    super(
      token,
      action,
      symbol,
      route,
      share,
      price,
      'GTC=DAY+',
      `Display=${display}`,
    );
  }
}
