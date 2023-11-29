/**
 * Enum representing order actions.
 */
export enum OrderAction {
  /**
   * Buy action.
   */
  Buy = 'B',

  /**
   * Sell action.
   */
  Sell = 'S',

  /**
   * Short action.
   */
  Short = 'SS',

  /**
   * Buy to open action.
   */
  BuyToOpen = 'BO',

  /**
   * Buy to close action.
   */
  BuyToClose = 'BC',

  /**
   * Sell to open action.
   */
  SellToOpen = 'SO',

  /**
   * Sell to close action.
   */
  SellToClose = 'SC',
}
