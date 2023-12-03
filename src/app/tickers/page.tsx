"use client";

import React, { Fragment, useEffect, useState } from "react";
import dayjs from "dayjs";
import classNames from "classnames";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

import { IOrder } from "@/types/note";

export default function TickerPage() {
  const [tickers, setTickers] = useState<string[]>([]);
  const [ticker, setTicker] = useState<string>(null);
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [ordersByYear, setOrdersByYear] = useState<{ [key: string]: IOrder[] }>(
    {},
  );
  const [totalUntilYear, setTotalUntilYear] = useState<{
    [key: string]: IOrder;
  }>({});

  useEffect(() => {
    getTickers();
  }, []);

  useEffect(() => {
    if (ticker) {
      getOrders(ticker);
    }
  }, [ticker]);

  const getTickers = async () => {
    const response = await fetch("/api/tickers", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      method: "GET",
      cache: "no-cache",
    });

    if (!response.ok) {
      console.error(response);

      alert("Error while fetching tickers");

      window.location.href = "/login";
    }

    const data = await response.json();

    console.table(data);

    setTickers([
      ...new Set(
        data.map((ticker: string) => {
          if (ticker.at(-1) === "F" && !isNaN(Number(ticker.at(-2)))) {
            return ticker.slice(0, -1);
          }

          return ticker;
        }),
      ),
    ]);
  };

  const getOrders = async (ticker: string) => {
    const response = await fetch(`/api/orders?ticker=${ticker}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      method: "GET",
      cache: "no-cache",
    });

    if (!response.ok) {
      console.error(response);

      alert("Error while fetching orders");

      window.location.href = "/login";
    }

    const orders = await response.json();

    setOrders(orders);

    const ordersByYear = orders.reduce(
      (acc: { [key: string]: IOrder[] }, order: IOrder) => {
        const year = Number(dayjs(order.date).format("YYYY"));

        if (acc[year]) {
          acc[year].push(order);
        } else {
          acc[year] = [order];
        }

        return acc;
      },
      {},
    );

    setOrdersByYear(ordersByYear);

    const totalUntilYear = Object.keys(ordersByYear).reduce(
      (acc: { [key: string]: IOrder }, year: string) => {
        const ordersUntilYear = orders.filter(
          (order: IOrder) => dayjs(order.date).format("YYYY") <= year,
        );

        const quantityUntilYear = ordersUntilYear.reduce(
          (acc: number, order: IOrder) => {
            if (order.type === "B") {
              return acc + order.quantity;
            } else {
              return acc - order.quantity;
            }
          },
          0,
        );

        const priceUntilYear = ordersUntilYear.reduce(
          (acc: number, order: IOrder) => {
            if (order.type === "B") {
              return acc + order.quantity * order.price;
            } else {
              return acc - order.quantity * order.price;
            }
          },
          0,
        );

        const feesUntilYear = ordersUntilYear.reduce(
          (acc: number, order: IOrder) => {
            return acc + order.fees;
          },
          0,
        );

        acc[year] = {
          quantity: quantityUntilYear,
          price: priceUntilYear / quantityUntilYear,
          netTotal: priceUntilYear,
          fees: feesUntilYear,
        };

        return acc;
      },
      {},
    );

    setTotalUntilYear(totalUntilYear);
  };

  return (
    <main className="p-7">
      <section className="flex justify-between">
        <h1 className="text-3xl font-bold">Tickers</h1>

        <Select
          onValueChange={(value) => {
            setTicker(value);
          }}
        >
          <SelectTrigger className="w-80">
            <SelectValue placeholder="Tickers" value={ticker} />
          </SelectTrigger>
          <SelectContent className="overflow-y-auto max-h-96">
            {tickers.map((ticker) => (
              <SelectItem key={ticker} value={ticker}>
                {ticker}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </section>

      <section className="rounded-md border mt-5">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Broker</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Ticker</TableHead>
              <TableHead>Quatity</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Cost</TableHead>
              <TableHead>Net total</TableHead>
              <TableHead>Fees</TableHead>
              <TableHead>Overall cost</TableHead>
              <TableHead>File name</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {Object.keys(ordersByYear).map((year) => (
              <Fragment key={year}>
                {ordersByYear[year]
                  .sort((a: IOrder, b: IOrder) => {
                    return dayjs(a.date).isBefore(dayjs(b.date)) ? -1 : 1;
                  })
                  .map((order: IOrder) => (
                    <TableRow
                      key={`${order.date}-${order.ticker}-${order.quantity}-${order.price}`}
                      className={classNames({
                        "text-red-500":
                          dayjs(order.date).format() !==
                          dayjs(order.fileName.slice(0, 10)).format(),
                      })}
                    >
                      <TableCell>
                        {dayjs(order.date).format("DD/MM/YYYY")}
                      </TableCell>
                      <TableCell>
                        {order.broker} ({order.noteNumber})
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={classNames({
                            "bg-blue-500": order.type === "B",
                            "bg-red-500": order.type === "S",
                          })}
                        >
                          {order.type}
                        </Badge>
                      </TableCell>
                      <TableCell>{order.ticker}</TableCell>
                      <TableCell>{order.quantity}</TableCell>
                      <TableCell>
                        {order.currency} {order.price.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        {order.currency}{" "}
                        {(order.price + order.fees / order.quantity).toFixed(2)}
                      </TableCell>
                      <TableCell>
                        {order.currency}{" "}
                        {(order.quantity * order.price).toFixed(2)}
                      </TableCell>
                      <TableCell>
                        {order.currency} {order.fees.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        {order.currency}{" "}
                        {(order.quantity * order.price + order.fees).toFixed(2)}
                      </TableCell>
                      <TableCell>{order.fileName}</TableCell>
                    </TableRow>
                  ))}

                <TableRow className="font-bold">
                  <TableCell>
                    {dayjs(year).endOf("year").format("DD/MM/YYYY")}
                  </TableCell>
                  <TableCell></TableCell>
                  <TableCell></TableCell>
                  <TableCell></TableCell>
                  <TableCell>{totalUntilYear[year].quantity}</TableCell>
                  <TableCell>
                    {ordersByYear[year][0].currency}{" "}
                    {totalUntilYear[year].price.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    {ordersByYear[year][0].currency}{" "}
                    {(
                      totalUntilYear[year].price +
                      totalUntilYear[year].fees / totalUntilYear[year].quantity
                    ).toFixed(2)}
                  </TableCell>
                  <TableCell>
                    {ordersByYear[year][0].currency}{" "}
                    {(
                      totalUntilYear[year].price * totalUntilYear[year].quantity
                    ).toFixed(2)}
                  </TableCell>
                  <TableCell>
                    {ordersByYear[year][0].currency}{" "}
                    {totalUntilYear[year].fees.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    {ordersByYear[year][0].currency}{" "}
                    {(
                      totalUntilYear[year].price *
                        totalUntilYear[year].quantity +
                      totalUntilYear[year].fees
                    ).toFixed(2)}
                  </TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </Fragment>
            ))}
          </TableBody>
        </Table>
      </section>
    </main>
  );
}
