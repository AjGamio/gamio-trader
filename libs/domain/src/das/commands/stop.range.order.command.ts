import { OrderAction } from '../enums';
import { BaseNewOrderCommand } from './new.oder.command';

/**
 * Stop Range: NEWORDER token b/s symbol route share STOPRANGE/STOPRANGEMKT LowPrice HighPrice
 * Example: NEWORDER 7 B MSFT SMAT 100 STOPRANGE 210.2 210.6
 *          NEWORDER 7 B MSFT SMAT 100 STOPRANGEMKT 210.2 210.6
 */
export class StopRangeOrderCommand extends BaseNewOrderCommand {
  constructor(
    token: string,
    action: OrderAction,
    symbol: string,
    route: string,
    share: string,
    isStopRangeMarket: boolean,
    lowPrice: string,
    highPrice: string,
  ) {
    super(
      token,
      action,
      symbol,
      route,
      share,
      isStopRangeMarket ? 'STOPRANGEMKT' : 'STOPRANGE',
      lowPrice,
      highPrice,
    );
  }
}
