import { NextRequest } from "next/server";
import JWT from "jsonwebtoken";

import { IUser } from "@/types/user";

export async function getUserRequest(
  request: NextRequest,
): Promise<IUser | null> {
  try {
    const authorization = request.headers.get("authorization");

    if (!authorization) {
      return null;
    }

    const token = authorization.replace("Bearer ", "");
    const user = JWT.verify(token, process.env.JWT_SECRET) as IUser;

    return user;
  } catch (error) {
    console.error(error);

    return null;
  }
}
