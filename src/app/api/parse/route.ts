import { NextRequest, NextResponse } from "next/server";
import PDFParser from "pdf-parse";

import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";

dayjs.extend(customParseFormat);

import { getAvenueOrders, getInterOrders } from "./template-helper";

export async function POST(request: NextRequest) {
  try {
    const data = await request.formData();
    const file: File | null = data.get("file") as unknown as File;

    if (!file) {
      return new Response("No file uploaded", { status: 400 });
    }

    const template = file.name.slice(11).slice(0, -4);
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const pdf = await PDFParser(buffer);
    const text = pdf.text;

    if (template === "AVENUE") {
      return NextResponse.json(getAvenueOrders(file.name, text, buffer));
    }

    if (template === "INTER") {
      return NextResponse.json(getInterOrders(file.name, text, buffer));
    }

    return new Response("Invalid template", { status: 400 });
  } catch (error) {
    console.error(error);

    return new Response(error.message, { status: 500 });
  }
}
