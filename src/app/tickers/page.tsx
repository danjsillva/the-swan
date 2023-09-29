import { Fragment } from "react";
import dayjs from "dayjs";
import classNames from "classnames";

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

export default async function TickerPage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const ticker = searchParams?.ticker;

  const response = await fetch(
    `${process.env.BASE_URL}/api/orders?ticker=${ticker}`
  );

  const orders = await response.json();

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
    {}
  );

  const totalUntilYear = Object.keys(ordersByYear).reduce(
    (acc: { [key: string]: any }, year: string) => {
      const ordersUntilYear = orders.filter(
        (order: IOrder) => dayjs(order.date).format("YYYY") <= year
      );

      const quantityUntilYear = ordersUntilYear.reduce(
        (acc: number, order: IOrder) => {
          if (order.type === "B") {
            return acc + order.quantity;
          } else {
            return acc - order.quantity;
          }
        },
        0
      );

      const priceUntilYear = ordersUntilYear.reduce(
        (acc: number, order: IOrder) => {
          if (order.type === "B") {
            return acc + order.quantity * order.price;
          } else {
            return acc - order.quantity * order.price;
          }
        },
        0
      );

      const feesUntilYear = ordersUntilYear.reduce(
        (acc: number, order: IOrder) => {
          return acc + order.fees;
        },
        0
      );

      acc[year] = {
        quantity: quantityUntilYear,
        price: priceUntilYear / quantityUntilYear,
        netTotal: priceUntilYear,
        fees: feesUntilYear,
      };

      return acc;
    },
    {}
  );

  return (
    <main className="p-7">
      <h1 className="text-4xl font-bold">{ticker}</h1>

      <section className="rounded-md border mt-5">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Year</TableHead>
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
                {ordersByYear[year].map((order: IOrder) => (
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
                    <TableCell>{order.broker}</TableCell>
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
