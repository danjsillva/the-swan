"use client";

import React, { useEffect, useState } from "react";
import dayjs from "dayjs";
import "dayjs/locale/pt-br";
import classNames from "classnames";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import { INote } from "@/types/note";

dayjs.locale("pt-br");

export default function ImportPage() {
  const [notes, setNotes] = useState<INote[]>([]);

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    if (!event.target.files) {
      return;
    }

    const files = event.target.files;
    const form = new FormData();

    const data = await Promise.all(
      Object.values(files).map(async (file) => {
        form.set("file", file);

        const response = await fetch("/api/parse", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          method: "POST",
          body: form,
          cache: "no-cache",
        });

        if (!response.ok) {
          console.error(response);

          alert("Error while parsing file");

          window.location.href = "/login";
        }

        return await response.json();
      }),
    );

    console.table(data);

    setNotes(data);

    event.target.files = null;
  };

  const handleImportClick = async (
    event: React.MouseEvent<HTMLButtonElement>,
  ) => {
    event.preventDefault();

    const data = await Promise.all(
      notes.map(async (note) => {
        const response = await fetch("/api/orders", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          method: "POST",
          body: JSON.stringify(note),
          cache: "no-cache",
        });

        if (!response.ok) {
          console.error(response);

          alert("Error while importing orders");

          window.location.href = "/login";
        }

        return await response.json();
      }),
    );

    console.table(data);

    alert("Success!");

    setNotes([]);
  };

  return (
    <main className="p-7">
      <section>
        <h1 className="text-3xl font-bold">Import</h1>
      </section>

      <section className=" mt-5 flex items-end gap-5">
        <div>
          <Label htmlFor="file">Brokerage Note</Label>
          <Input
            name="file"
            type="file"
            onChange={handleFileChange}
            accept="application/pdf"
            multiple
          />
        </div>

        <Button
          type="button"
          onClick={handleImportClick}
          disabled={notes.length === 0}
        >
          Import orders
        </Button>
      </section>

      {notes.map((note) => (
        <section key={note[0].noteNumber} className="rounded-md border mt-5">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Broker</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Ticker</TableHead>
                <TableHead>Quatity</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Net total</TableHead>
                <TableHead>Fees</TableHead>
                <TableHead>Overall cost</TableHead>
                <TableHead>File name</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {note.map((order) => (
                <TableRow
                  key={order.ticker + order.price + order.quantity}
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
                    {order.currency} {(order.quantity * order.price).toFixed(2)}
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
            </TableBody>
          </Table>
        </section>
      ))}
    </main>
  );
}
