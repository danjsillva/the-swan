import { NextRequest, NextResponse } from "next/server";

import connectMongo from "@/database/config";
import Order from "@/database/models/order";

export async function POST(request: NextRequest) {
  try {
    await connectMongo();

    const data = await request.json();

    const persistedOrders = await Promise.all(
      data.map(async (order) => {
        const persistedOrder = await Order.findOne({
          date: order.date,
          noteNumber: order.noteNumber,
          type: order.type,
          ticker: order.ticker,
          price: order.price
        });

        if (persistedOrder) {
          return persistedOrder;
        }

        return await Order.create(order);
      })
    );

    return NextResponse.json(persistedOrders);
  } catch (error) {
    console.error(error);

    return new Response(error.message, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    await connectMongo();

    const url = new URL(request.url);
    const ticker = url.searchParams.get("ticker");

    const persistedOrders = await Order.find({
      ticker: { $regex: new RegExp(ticker, "i")}
    }).select({
      fileText: 0,
      fileBuffer: 0,
    }).sort({
      date: -1
    });

    return NextResponse.json(persistedOrders);
  } catch (error) {
    console.error(error);

    return new Response(error.message, { status: 500 });
  }
}
