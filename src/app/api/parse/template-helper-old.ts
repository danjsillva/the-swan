import dayjs from "dayjs";

import {
  Note,
  Order,
  BROKER,
  CURRENCY,
  ORDER_TYPE,
  STOCK_EXCHANGE,
} from "@/types/note";

export function getAvenueNote(
  name: string,
  text: string,
  buffer: Buffer
): Note {
  const lines = text
    .split(/\r?\n|\r|\n/g)
    .slice(
      text.split(/\r?\n|\r|\n/g).findIndex((line) => line === "AcctType") + 19
    );

  if (!lines) {
    throw new Error("Invalid note");
  }

  const orderLines = lines
    .slice(0, -(lines.length % 30))
    .reduce((total, _value, index, array) => {
      if (index % 30 === 0) {
        total.push(array.slice(index, index + 30));
      }

      return total;
    }, []);

  const orders: Order[] = orderLines.map((line) => {
    const date = dayjs(line[2], "MM/DD/YY");
    const type = line[1];
    const ticker = line[5];
    const quantity = Number(line[4]);
    const price = Number(line[6]);

    const totalFees =
      Number(line[8]) + Number(line[9]) + Number(line[10]) + Number(line[21]);

    const totalOrder = Number(line[7]);

    if (!date || !type || !ticker) {
      throw new Error("Invalid order line");
    }

    return {
      date: date.toDate(),
      type: type === "B" ? ORDER_TYPE.BUY : ORDER_TYPE.SELL,
      ticker,
      quantity: quantity,
      price: price,
      fees: totalFees,
      total: totalOrder,
    };
  });

  const note: Note = {
    number: orders[0].date.valueOf().toString(),
    date: orders[0].date,
    stockExchange: STOCK_EXCHANGE.NYSE,
    broker: BROKER.AVENUE,
    currency: CURRENCY.USD,
    orders,
    totalOperations: orders.reduce((total, order) => total + order.total, 0),
    totalFees: orders.reduce((total, order) => total + order.fees, 0),
    fileName: name,
    fileText: text,
    fileBuffer: buffer,
  };

  return note;
}

export function getInterNote(name: string, text: string, buffer: Buffer): Note {
  const lines = text.split(/\r?\n|\r|\n/g);

  const date = dayjs(
    lines
      .find((line) => line.startsWith("Data pregão:"))
      ?.replace("Data pregão: ", ""),
    "DD/MM/YYYY"
  );

  const number = lines
    .find((line) => line.startsWith("Nº Nota:"))
    ?.replace("Nº Nota: ", "");

  if (!date || !number) {
    throw new Error("Invalid note date or number");
  }

  const totalOperations =
    Number(
      lines
        .find((line) => line.startsWith("Valor Líquido das Operações(1)"))
        ?.replace("Valor Líquido das Operações(1)", "")
        .replace(/\D/g, "")
    ) / 100;

  const clearingFee =
    Number(
      lines
        .find((line) => line.startsWith("Taxa de Liquidação(2)"))
        ?.replace("Taxa de Liquidação(2)", "")
        .replace(/\D/g, "")
    ) / 100;

  const registrationFee =
    Number(
      lines
        .find((line) => line.startsWith("Taxa de Registro(3)"))
        ?.replace("Taxa de Registro(3)", "")
        .replace(/\D/g, "")
    ) / 100;

  const termOptionsFuturesFee =
    Number(
      lines
        .find((line) => line.startsWith("Taxa de Termo/Opções/Futuro"))
        ?.replace("Taxa de Termo/Opções/Futuro", "")
        .replace(/\D/g, "")
    ) / 100;

  const anaFee =
    Number(
      lines
        .find((line) => line.startsWith("Taxa A.N.A"))
        ?.replace("Taxa A.N.A", "")
        .replace(/\D/g, "")
    ) / 100;

  const emolumentsFee =
    Number(
      lines
        .find((line) => line.startsWith("Emolumentos"))
        ?.replace("Emolumentos", "")
        .replace(/\D/g, "")
    ) / 100;

  const brokerageFee =
    Number(
      lines
        .find((line) => line.startsWith("Corretagem"))
        ?.replace("Corretagem", "")
        .replace(/\D/g, "")
    ) / 100;

  const issFee =
    Number(
      lines
        .find((line) => line.startsWith("ISS"))
        ?.replace("ISS", "")
        .replace(/\D/g, "")
    ) / 100;

  const irrfFee =
    Number(
      lines
        .find((line) => line.startsWith("I.R.R.F. s/ operações, base 0,00"))
        ?.replace("I.R.R.F. s/ operações, base 0,00", "")
        .replace(/\D/g, "")
    ) / 100;

  const otherFee =
    Number(
      lines
        .find((line) => line.startsWith("Outras"))
        ?.replace("Outras", "")
        .replace(/\D/g, "")
    ) / 100;

  const totalFees =
    clearingFee +
    registrationFee +
    termOptionsFuturesFee +
    anaFee +
    emolumentsFee +
    brokerageFee +
    issFee +
    irrfFee +
    otherFee;

  const orders: Order[] = lines
    .filter((line) => line.includes("1-Bovespa"))
    .map((line) => {
      const [
        market,
        _marketType,
        ticker,
        _tickerType,
        _tickerSegment,
        quantity,
        price,
        total,
        _totalType,
      ] = line.split(/\s+/g).filter(Boolean);

      if (!ticker || !quantity || !price || !total) {
        throw new Error("Invalid order line");
      }

      const totalOrder = Number(total.replace(".", "").replace(",", "."));
      const totalOrderPercentage = Number((totalOrder / totalOperations) * 100);
      const totalOrderFees = Number((totalOrderPercentage / 100) * totalFees);

      return {
        date: date.toDate(),
        type: market.slice(-1) === "C" ? ORDER_TYPE.BUY : ORDER_TYPE.SELL,
        ticker,
        quantity: Number(quantity),
        price: Number(price.replace(".", "").replace(",", ".")),
        fees: totalOrderFees,
        total: totalOrder,
      };
    });

  const note: Note = {
    number: number,
    date: date.toDate(),
    stockExchange: STOCK_EXCHANGE.B3,
    broker: BROKER.INTER,
    currency: CURRENCY.BRL,
    orders,
    totalOperations,
    totalFees,
    fileName: name,
    fileText: text,
    fileBuffer: buffer,
  };

  return note;
}
