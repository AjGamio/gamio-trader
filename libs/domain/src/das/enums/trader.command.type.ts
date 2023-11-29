/**
 * Enum representing trader command types.
 */
export enum TraderCommandType {
  /**
   * No command.
   */
  None = 0,

  /**
   * LOGIN_COMMAND
   * The client sends login to the server.
   */
  LOGIN_COMMAND = 'LOGIN',

  /**
   * LOGIN_RESPONSE
   * The client sends login Occurred.
   */
  LOGIN_RESPONSE = '#LOGIN',

  /**
   * POS_BEGIN_RESPONSE
   * Mark the start when the server sends position list to the client.
   */
  POS_BEGIN_RESPONSE = '#POS',

  /**
   * POS_END_RESPONSE
   * Mark the end when the server sends position list to the client.
   */
  POS_END_RESPONSE = '#POSEND',

  /**
   * POS_RESPONSE
   * Position Details.
   */
  POS_RESPONSE = '%POS',

  /**
   * POSREFRESH_COMMAND
   * User can use this command to query all positions.
   */
  POSREFRESH_COMMAND = 'POSREFRESH',

  /**
   * ORDER_BEGIN_RESPONSE
   * Mark the start when the server sends order list to the client.
   */
  ORDER_BEGIN_RESPONSE = '#Order',

  /**
   * ORDER_END_RESPONSE
   * Mark the end when the server sends order list to the client.
   */
  ORDER_END_RESPONSE = '#OrderEnd',

  /**
   * ORDER_RESPONSE
   * Order details.
   */
  ORDER_RESPONSE = '%ORDER',

  /**
   * ORDER_ACTION_MESSAGE_RESPONSE
   * Order’s action message.
   */
  ORDER_ACTION_MESSAGE_RESPONSE = '%OrderAct',

  /**
   * TRADE_BEGIN_RESPONSE
   * Mark the start when the server sends trade list to the client.
   */
  TRADE_BEGIN_RESPONSE = '#Trade',

  /**
   * TRADE_END_RESPONSE
   * Mark the end when the server sends trade list to the client.
   */
  TRADE_END_RESPONSE = '#TradeEnd',

  /**
   * TRADE_RESPONSE
   * Trade details.
   */
  TRADE_RESPONSE = '%TRADE',

  /**
   * NEWORDER_COMMAND
   * Place new order.
   */
  NEWORDER_COMMAND = 'NEWORDER',

  /**
   * CANCEL_COMMAND
   * Cancel an order or all open orders.
   */
  CANCEL_COMMAND = 'CANCEL',

  /**
   * GET_BUYING_POWER_COMMAND
   * Get current buying power of login account.
   */
  GET_BUYING_POWER_COMMAND = 'GET BP',

  /**
   * BUYING_POWER_RESPONSE
   * The server sends the account’s current day buying power and overnight buying power of the account.
   */
  BUYING_POWER_RESPONSE = 'BP',

  /**
   * GET_SHORTINFO_COMMAND
   * Get a symbol’s short info, including shortable, short size, marginable, long/short margin rate.
   */
  GET_SHORTINFO_COMMAND = 'GET SHORTINFO',

  /**
   * SHORTINFO_RESPONSE
   * This is returned symbol shortable info queried by GET SHORTINFO.
   */
  SHORTINFO_RESPONSE = '$SHORTINFO',

  /**
   * SB_COMMAND
   * Subscribe symbol quote data.
   */
  SB_COMMAND = 'SB',

  /**
   * UNSB_COMMAND
   * Unsubscribe symbol quote data.
   */
  UNSB_COMMAND = 'UNSB',

  /**
   * QUOTE_RESPONSE
   * Symbol’s level1 quote data.
   */
  QUOTE_RESPONSE = '$Quote',

  /**
   * TS_RESPONSE
   * Symbol’s time/sale quote data.
   */
  TS_RESPONSE = '$T&S',

  /**
   * LV2_RESPONSE
   * Symbol’s level2 quote data.
   */
  LV2_RESPONSE = '$Lv2',

  /**
   * BAR_RESPONSE
   * Day/Minute chart data.
   */
  BAR_RESPONSE = '$BAR',

  /**
   * LDLU_RESPONSE
   * Limit Down Price/Limit Up Price.
   */
  LDLU_RESPONSE = '$LDLU',

  /**
   * IORDER_RESPONSE
   * Same definition with %ORDER, but for watch connection.
   */
  IORDER_RESPONSE = '%IORDER',

  /**
   * IPOS_RESPONSE
   * Same definition with %POS, but for watch connection.
   */
  IPOS_RESPONSE = '%IPOS',

  /**
   * ITRADE_RESPONSE
   */
  ITRADE_RESPONSE = '%ITRADE',

  /**
   * ECHO_COMMAND
   * The server will return ECHO on/off status.
   */
  ECHO_COMMAND = 'ECHO',

  /**
   * CLIENT_COMMAND
   * The server will return connected client numbers.
   */
  CLIENT_COMMAND = 'CLIENT',

  /**
   * CLIENT_RESPONSE
   * Connected client numbers.
   */
  CLIENT_RESPONSE = 'Client number',

  /**
   * ORDER_SERVER_CONNECTION_STATUS_COMMAND
   * Order Server connection status.
   * Does not work.
   */
  ORDER_SERVER_CONNECTION_STATUS_COMMAND = 'Order Server connection status',

  /**
   * ORDER_SERVER_LOGON_STATUS_COMMAND
   * Order Server logon status.
   * Does not work.
   */
  ORDER_SERVER_LOGON_STATUS_COMMAND = 'Order Server logon status',

  /**
   * QUOTE_SERVER_CONNECTION_STATUS_COMMAND
   * Quote Server connection status.
   * Does not work.
   */
  QUOTE_SERVER_CONNECTION_STATUS_COMMAND = 'Quote Server connection status',

  /**
   * QUOTE_SERVER_LOGON_STATUS_COMMAND
   * Quote Server logon status.
   * Does not work.
   */
  QUOTE_SERVER_LOGON_STATUS_COMMAND = 'Quote Server logon status"',

  /**
   * ORDER_SERVER_CONNECTION_STATUS_RESPONSE
   */
  ORDER_SERVER_CONNECTION_STATUS_RESPONSE = '#OrderServer:Connect:',

  /**
   * ORDER_SERVER_LOGON_STATUS_RESPONSE
   */
  ORDER_SERVER_LOGON_STATUS_RESPONSE = '#OrderServer:Logon:',

  /**
   * QUOTE_SERVER_CONNECTION_STATUS_RESPONSE
   */
  QUOTE_SERVER_CONNECTION_STATUS_RESPONSE = '#QuoteServer:Connect:',

  /**
   * QUOTE_SERVER_LOGON_STATUS_RESPONSE
   */
  QUOTE_SERVER_LOGON_STATUS_RESPONSE = '#QuoteServer:Logon:',

  /**
   * SCRIPT_COMMAND
   */
  SCRIPT_COMMAND = 'SCRIPT',

  /**
   * QUIT_COMMAND
   * Disconnect from the server.
   */
  QUIT_COMMAND = 'QUIT',

  /**
   * SLPRICEINQUIRE_COMMAND
   * Inquire related locate price.
   */
  SLPRICEINQUIRE_COMMAND = 'SLPRICEINQUIRE',

  /**
   * SLNEWORDER_COMMAND
   * Place a short locate order.
   */
  SLNEWORDER_COMMAND = 'SLNEWORDER',

  /**
   * SLCANCELORDER_COMMAND
   * Cancel an open locate order.
   */
  SLCANCELORDER_COMMAND = 'SLCANCELORDER',

  /**
   * SLOFFEROPERATION_COMMAND
   * Accept or reject an offered locate order.
   */
  SLOFFEROPERATION_COMMAND = 'SLOFFEROPERATION',

  /**
   * SLRET_RESPONSE
   * This command returns the price inquire result for command SLPRICEINQUIRE and SLNEWORDER failure (already shortable etc.).
   */
  SLRET_RESPONSE = '%SLRET',

  /**
   * SLORDER_BEGIN_RESPONSE
   * Mark the start when the server sends short locate order list to the client.
   */
  SLORDER_BEGIN_RESPONSE = '#SLOrder',

  /**
   * SLORDER_END_RESPONSE
   * Mark the end when the server sends short locate order list to the client.
   */
  SLORDER_END_RESPONSE = '#SLOrderEnd',

  /**
   * SLORDER_RESPONSE
   * Short locate order. Order server will return this message when short locate order action changed.
   */
  SLORDER_RESPONSE = '%SLOrder',

  /**
   * SLAVAILQUERY_COMMAND
   * Query available locate shares to short.
   */
  SLAVAILQUERY_COMMAND = 'SLAvailQuery',

  /**
   * SLAVAILQUERY_RET_RESPONSE
   * Query result for SLAvailQuery.
   */
  SLAVAILQUERY_RET_RESPONSE = '$SLAvailQueryRet',
}
