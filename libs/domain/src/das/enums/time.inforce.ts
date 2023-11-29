/**
 * Enum representing time in force options.
 */
export enum TimeInForce {
  /**
   * Day option.
   */
  Day = 'DAY',

  /**
   * Day Plus option.
   */
  DayPlus = 'DAY+',

  /**
   * Immediate or Cancel option.
   */
  IOC = 'IOC',

  /**
   * At Open option.
   */
  AtOpen = 'AtOpen',

  /**
   * At Close option.
   */
  AtClose = 'AtClose',

  /**
   * Fill or Kill option.
   */
  FOK = 'FOK',

  /**
   * Good 'til Cancelled option.
   */
  GTC = 'GTC',
}
