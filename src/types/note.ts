export enum ORDER_TYPE {
  BUY = "B",
  SELL = "S",
}

export enum STOCK_EXCHANGE {
  B3 = "B3",
  NYSE = "NYSE",
  NASDAQ = "Nasdaq",
}

export enum BROKER {
  AVENUE = "AVENUE",
  INTER = "INTER",
}

export enum CURRENCY {
  BRL = "BRL",
  USD = "USD",
}

export type Order = {
  id?: string;
  date: Date;
  noteNumber: string;
  broker: BROKER;
  currency: CURRENCY;
  stockExchange: STOCK_EXCHANGE;
  type: ORDER_TYPE;
  ticker: string;
  quantity: number;
  price: number;
  fees: number;
  fileName: string;
  fileText: string;
  fileBuffer: Buffer;
};