"use client";

import { useState } from "react";
import dayjs from "dayjs";
import "dayjs/locale/pt-br";
import classNames from "classnames";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";

dayjs.locale("pt-br");

export default function Home() {
  const [notes, setNotes] = useState<any[]>([]);

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
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
          method: "POST",
          body: form,
        });

        return await response.json();
      })
    );

    setNotes(data);

    console.log(data);

    event.target.files = null;
  };

  const handleImportClick = async (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.preventDefault();

    const data = await Promise.all(
      notes.map(async (note) => {
        const response = await fetch("/api/notes", {
          method: "POST",
          body: JSON.stringify(note),
        });

        return await response.json();
      })
    );

    alert("Success!");

    console.log(data);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <section className="grid w-full max-w-sm items-center gap-1.5">
        <Label htmlFor="picture">Brokerage Note</Label>
        <Input
          type="file"
          onChange={handleFileChange}
          accept="application/pdf"
          multiple
        />
      </section>

      <section className="grid w-full items-center gap-1.5">
        <Button
          type="button"
          onClick={handleImportClick}
          disabled={notes.length === 0}
        >
          Import
        </Button>

        {/* {JSON.stringify(notes)} */}

        {notes.map((note) => (
          <Table key={note[0].noteNumber}>
            <TableHeader>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Broker</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Ticker</TableCell>
                <TableCell>Quatity</TableCell>
                <TableCell>Price</TableCell>
                <TableCell>Net total</TableCell>
                <TableCell>Fees</TableCell>
                <TableCell>Overall cost</TableCell>
                <TableCell>File name</TableCell>
              </TableRow>
            </TableHeader>

            <TableBody>
              {note.map((order) => (
                <TableRow
                  key={order.ticker}
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
                  <TableCell>{order.type}</TableCell>
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
        ))}
      </section>
    </main>
  );
}
