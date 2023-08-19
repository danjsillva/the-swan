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

export async function GET() {
  try {
    await connectMongo();

    const persistedOrders = await Order.find({});

    return NextResponse.json(persistedOrders);
  } catch (error) {
    console.error(error);

    return new Response(error.message, { status: 500 });
  }
}
