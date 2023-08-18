import dayjs from "dayjs";

import {
  IOrder,
  BROKER,
  CURRENCY,
  ORDER_TYPE,
  STOCK_EXCHANGE,
} from "@/types/note";

export function getAvenueOrders(
  name: string,
  text: string,
  buffer: Buffer
): IOrder[] {
  const lines = text
    .split(/\r?\n|\r|\n/g)
    .slice(
      text.split(/\r?\n|\r|\n/g).findIndex((line) => line === "Trade#") + 6
    );

  if (!lines) {
    throw new Error("Invalid note");
  }

  const orders: IOrder[] = lines.reduce((result, value, index, array) => {
    if (
      dayjs(value, "MM/DD/YY").isValid() &&
      dayjs(array[index + 1], "MM/DD/YY").isValid()
    ) {
      const date = dayjs(array[index], "MM/DD/YY");
      const type = array[index - 1];
      const ticker = array[index + 3];
      const quantity = Number(array[index + 2]);
      const price = Number(array[index + 4]);

      const totalFees =
        Number(array[index + 6]) +
        Number(array[index + 7]) +
        Number(array[index + 8]);

      if (!date || !type || !ticker) {
        throw new Error("Invalid order line");
      }

      result.push({
        date: date.toDate(),
        noteNumber: date.valueOf().toString(),
        broker: BROKER.AVENUE,
        currency: CURRENCY.USD,
        stockExchange: STOCK_EXCHANGE.NYSE,
        type: type === "B" ? ORDER_TYPE.BUY : ORDER_TYPE.SELL,
        ticker,
        quantity: quantity,
        price: price,
        fees: totalFees,
        fileName: name,
        fileText: text,
        fileBuffer: buffer,
      });
    }

    return result;
  }, []);

  return orders;
}

export function getInterOrders(
  name: string,
  text: string,
  buffer: Buffer
): IOrder[] {
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
        .find((line) => line.startsWith("Valor das Operações"))
        ?.replace("Valor das Operações", "")
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
        .find((line) =>
          line.startsWith(
            `I.R.R.F. s/ operações, base ${lines
              .find((line) => line.startsWith("Vendas à Vista"))
              ?.replace("Vendas à Vista", "")}`
          )
        )
        ?.replace(
          `I.R.R.F. s/ operações, base ${lines
            .find((line) => line.startsWith("Vendas à Vista"))
            ?.replace("Vendas à Vista", "")}`,
          ""
        )
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

  const orders: IOrder[] = lines
    .filter((line) => line.includes("1-Bovespa"))
    .map((line) => {
      const [market, _marketType, ticker, ..._rest] = line
        .split(/\s+/g)
        .filter(Boolean);

      const [_totalType, total, price, quantity, ..._restReverse] = line
        .split(/\s+/g)
        .filter(Boolean)
        .reverse();

      if (!ticker || !quantity || !price || !total) {
        throw new Error("Invalid order line");
      }

      const totalOrder = Number(total.replace(".", "").replace(",", "."));
      const totalOrderPercentage = Number((totalOrder / totalOperations) * 100);
      const totalOrderFees = Number((totalOrderPercentage / 100) * totalFees);

      return {
        date: date.toDate(),
        noteNumber: number,
        broker: BROKER.INTER,
        currency: CURRENCY.BRL,
        stockExchange: STOCK_EXCHANGE.B3,
        type: market.slice(-1) === "C" ? ORDER_TYPE.BUY : ORDER_TYPE.SELL,
        ticker,
        quantity: Number(quantity),
        price: Number(price.replace(".", "").replace(",", ".")),
        fees: totalOrderFees,
        fileName: name,
        fileText: text,
        fileBuffer: buffer,
      };
    });

  return orders;
}
