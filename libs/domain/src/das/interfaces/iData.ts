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

export interface JsonData {
  LOGIN: {
    STATUS: string;
    POS: Position[];
    Order: Order[];
    Trade: Trade[];
    SLOrder: SLOrder[];
    OrderAct: OrderAction[];
  };
}
