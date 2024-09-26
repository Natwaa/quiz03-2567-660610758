import jwt from "jsonwebtoken";

import { DB, readDB } from "@lib/DB";
import { NextRequest, NextResponse } from "next/server";

import { Database } from "@lib/DB";

export const POST = async (request: NextRequest) => {
  readDB();
  const body = await request.json();
  const { username, password } = body;
  const user = (<Database>DB).users.find(
    (user) => user.username === username && user.password === password
  );

  if (!user) {
    return NextResponse.json(
      {
        ok: false,
        message: "Username or Password is incorrect",
      },
      { status: 400 }
    );
  }

  const serect = process.env.JWT_SECRET || "This is another secret";

  const token = jwt.sign(
    {role:user.role}, 
    serect,
    { expiresIn: "8h" }
  );

  return NextResponse.json({ ok: true, token });
};
