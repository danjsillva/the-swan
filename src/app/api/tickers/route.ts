import { NextRequest, NextResponse } from "next/server";

import connectMongo from "@/database/config";
import Order from "@/database/models/order";

import { getUserRequest } from "@/utils/auth";

export async function GET(request: NextRequest) {
  try {
    const user = await getUserRequest(request);

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    await connectMongo();

    const persistedTickers = await Order.find({}).distinct("ticker");

    return NextResponse.json(persistedTickers);
  } catch (error) {
    console.error(error);

    return new Response(error.message, { status: 500 });
  }
}
