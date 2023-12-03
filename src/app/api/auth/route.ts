import { NextRequest, NextResponse } from "next/server";
import JWT from "jsonwebtoken";

import connectMongo from "@/database/config";
import User from "@/database/models/user";
import { IUser } from "@/types/user";

export async function POST(request: NextRequest) {
  try {
    await connectMongo();

    const data = await request.json();
    const persistedUser = await User.findOne({ login: data.login });

    if (!persistedUser) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const parsedUser = persistedUser.toJSON() as IUser;

    if (parsedUser.password !== data.password) {
      return NextResponse.json(
        { message: "Invalid password" },
        { status: 401 },
      );
    }

    delete parsedUser.password;

    const token = JWT.sign(parsedUser, process.env.JWT_SECRET, {
      expiresIn: "30d",
    });

    return NextResponse.json({
      user: parsedUser,
      token,
    });
  } catch (error) {
    console.error(error);

    return new Response(error.message, { status: 500 });
  }
}
