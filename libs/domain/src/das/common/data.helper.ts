import { JsonData, Order, OrderAction, Position, SLOrder, Trade } from '../interfaces/iData';

const convertDataToJSON = (dataString: string): JsonData => {
  const prefixMap: Record<string, string> = {
    '#LOGIN': 'STATUS',
    '%POS': 'POS',
    '%Order': 'Order',
    '%ORDER': 'Order',
    '%Trade': 'Trade',
    '%TRADE': 'Trade',
    '%SLOrder': 'SLOrder',
    '%OrderAct': 'OrderAct',
  };

  const hasError = dataString.includes('ERROR');
  const jsonData: JsonData = {
    LOGIN: {
      STATUS: hasError ? dataString : 'successed',
      POS: [],
      Order: [],
      Trade: [],
      SLOrder: [],
      OrderAct: [],
    },
  };
  const lines = dataString.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    const prefix = Object.keys(prefixMap).find((key) => line.startsWith(key));

    if (prefix) {
      const key = prefixMap[prefix];
      if (key === 'STATUS') {
        jsonData.LOGIN[key] = line.split(' ')[1];
      } else {
        const obj = {};
        switch (key) {
          case 'POS':
            const positionData = convertPositionDataToJSON(line);
            if (positionData) {
              Object.assign(obj, positionData);
            }
            break;
          case 'Order':
          case 'ORDER':
            const orderData = convertOrderDataToJSON(line);
            if (orderData) {
              Object.assign(obj, orderData);
            }
            break;
          case 'Trade':
          case 'TRADE':
            const tradeData = convertTradeDataToJSON(line);
            if (tradeData) {
              Object.assign(obj, tradeData);
            }
            break;
          case 'SLOrder':
            const slOrderData = convertSLOrderDataToJSON(line);
            if (slOrderData) {
              Object.assign(obj, slOrderData);
            }
            break;
          case 'OrderAct':
            const orderActData = convertOrderActDataToJSON(line);
            if (orderActData) {
              Object.assign(obj, orderActData);
            }
            break;
        }

        if (Object.keys(obj).length > 0) {
          jsonData.LOGIN[key].push(obj);
        }
      }
    }
  }

  return jsonData;
};

const convertTradeDataToJSON = (dataString: string): Trade | null => {
  const lines = dataString.split('\n');
  const tradeData: Trade[] = [];

  for (const line of lines) {
    const components = line.trim().split(/\s+/);

    if (components.length >= 8) {
      const [, id, symbol, bs, qty, price, route, time, orderid] = components;

      const trade: Trade = {
        id,
        symb: symbol,
        'b/s': bs,
        qty: parseInt(qty),
        price: parseFloat(price),
        route,
        time,
        orderid: parseInt(orderid),
      };

      if (Object.keys(trade).length === 8) {
        tradeData.push(trade);
      }
    }
  }

  return tradeData[0] || null;
};

const convertPositionDataToJSON = (dataString: string): Position | null => {
  const lines = dataString.split('\n');
  const positionData: Position[] = [];

  for (const line of lines) {
    const components = line.trim().split(/\s+/);

    if (components.length >= 8) {
      const [
        ,
        symbol,
        quantity,
        price,
        field4,
        field5,
        field6,
        field7,
        timestamp,
      ] = components;

      const position: Position = {
        symb: symbol,
        type: parseInt(quantity),
        qty: parseFloat(price),
        avgcost: parseInt(field4),
        initqty: parseInt(field5),
        initprice: parseInt(field6),
        Realized: parseInt(field7),
        CreatTime: timestamp,
      };

      if (Object.keys(position).length === 8) {
        positionData.push(position);
      }
    }
  }

  return positionData[0] || null;
};

const convertOrderDataToJSON = (dataString: string): Order | null => {
  const lines = dataString.split('\n');
  const orderData: Order[] = [];

  for (const line of lines) {
    const components = line.trim().split(/\s+/);

    if (components.length >= 12) {
      const [
        ,
        id,
        token,
        symbol,
        bs,
        market,
        qty,
        lvqty,
        cxlqty,
        price,
        route,
        status,
        time,
      ] = components;

      const order: Order = {
        id,
        token,
        symb: symbol,
        'b/s': bs,
        'mkt/lmt': market,
        qty: parseInt(qty),
        lvqty: parseInt(lvqty),
        cxlqty: parseInt(cxlqty),
        price: parseFloat(price),
        route,
        status,
        time,
      };

      if (Object.keys(order).length === 12) {
        orderData.push(order);
      }
    }
  }

  return orderData[0] || null;
};

const convertSLOrderDataToJSON = (dataString: string): SLOrder | null => {
  const lines = dataString.split('\n');
  const slOrderData: SLOrder[] = [];

  for (const line of lines) {
    const components = line.trim().split(/\s+/);

    if (components.length >= 8) {
      const [
        ,
        id,
        symbol,
        shares,
        openShares,
        exeShares,
        exePrice,
        status,
        route,
        time,
        notes,
      ] = components;

      const slOrder: SLOrder = {
        id,
        symb: symbol,
        shares: parseInt(shares),
        openshares: parseInt(openShares),
        exeshares: parseInt(exeShares),
        exeprice: parseFloat(exePrice),
        status,
        route,
        time,
        notes,
      };

      slOrderData.push(slOrder);
    }
  }

  return slOrderData[0] || null;
};

const convertOrderActDataToJSON = (dataString: string): OrderAction | null => {
  const lines = dataString.split('\n');
  const orderActData: OrderAction[] = [];

  for (const line of lines) {
    const components = line.trim().split(/\s+/);

    if (components.length >= 8) {
      const [
        ,
        id,
        actionType,
        action,
        symbol,
        shares,
        price,
        route,
        time,
        notes,
      ] = components;

      const orderAction: OrderAction = {
        id,
        actionType,
        action,
        symb: symbol,
        shares: parseInt(shares),
        price: parseFloat(price),
        route,
        time,
        notes,
      };

      orderActData.push(orderAction);
    }
  }

  return orderActData[0] || null;
};

export const processSocketData = (data: string): JsonData =>
  convertDataToJSON(data);
