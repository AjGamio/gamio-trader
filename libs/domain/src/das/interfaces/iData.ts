import { ITradeBot } from 'gamio/domain/trade-bot/itradeBot';
import { TraderCommandType } from '../enums';
import { ITickerData } from 'gamio/domain/polygon/interfaces/iTickerData';

export enum OrderOrTradeType {
  Bots = 'bots',
  BotTrades = 'bot-trades',
  Orders = 'orders',
  Trades = 'trades',
}

export interface Trade {
  id: string;
  symb: string;
  'b/s': string;
  qty: number;
  price: number;
  route: string;
  time: string;
  orderid: number;
}

export interface Position {
  symb: string;
  type: number;
  qty: number;
  avgcost: number;
  initqty: number;
  initprice: number;
  Realized: number;
  CreatTime: string;
}

export interface Order {
  id: string;
  token: string;
  symb: string;
  'b/s': string;
  'mkt/lmt': string;
  qty: number;
  lvqty: number;
  cxlqty: number;
  price: number;
  route: string;
  status: string;
  time: string;
}

export interface SLOrder {
  id: string;
  symb: string;
  shares: number;
  openshares: number;
  exeshares: number;
  exeprice: number;
  status: string;
  route: string;
  time: string;
  notes: string;
}

export interface OrderAction {
  id: string;
  actionType: string;
  action: string;
  symb: string;
  shares: number;
  price: number;
  route: string;
  time: string;
  notes: string;
}

export interface BuyingPower {
  bp: number;
  nbp: number;
}

export interface JsonData {
  STATUS: string;
  POS: Position[];
  Order: Order[];
  Trade: Trade[];
  SLOrder: SLOrder[];
  OrderAct: OrderAction[];
  BP: BuyingPower[];
  Clients: string[];
  Extras: string[];
  OrderSending: any[];
}

export interface CommandData {
  commandType: TraderCommandType;
  dataId: string;
  data: JsonData | string;
}

export type CommandDictionary = Record<
  string,
  { commandType: TraderCommandType; emitted: boolean }
>;

export interface FilteredTickersData {
  bot: ITradeBot;
  tickers: ITickerData[];
  status: 'waiting' | 'processing' | 'processed' | 'empty';
  processingDateTime?: { start: Date; finish: Date };
}
