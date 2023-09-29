import { NextResponse } from "next/server";

import connectMongo from "@/database/config";
import Order from "@/database/models/order";

export async function GET() {
  try {
    await connectMongo();

    const persistedTickers = await Order.find({}).distinct("ticker");

    return NextResponse.json(persistedTickers);
  } catch (error) {
    console.error(error);

    return new Response(error.message, { status: 500 });
  }
}
