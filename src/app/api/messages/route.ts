import { DB, readDB, writeDB } from "@lib/DB";
import { checkToken } from "@lib/checkToken";
import { nanoid } from "nanoid";
import { NextRequest, NextResponse } from "next/server";

import { Database ,Payload } from "@lib/DB";

export const GET = async (request: NextRequest) => {
  readDB();
  const ID = request.nextUrl.searchParams.get("roomId");

  const messages =(<Database>DB).messages.filter((x) => x.roomId === ID);
  if (messages.length === 0) {
    return NextResponse.json(
      {
        ok: false,
        message: `Room is not found`,
      },
      { status: 404 }
    );
  }

  return NextResponse.json({
    ok: true,
    messages: messages,
    }, { status:200}
  );
};

export const POST = async (request: NextRequest) => {
  readDB();

  const body = await request.json();
  const{roomId, messageText} = body;
  
  const foundRoom = (<Database>DB).rooms.find((x) => x.roomId === roomId);
  if (!foundRoom){
    return NextResponse.json(
      {
        ok: false,
        message: `Room is not found`,
      },
      { status: 404 }
    );
  }

  const messageId = nanoid();

  (<Database>DB).messages.push({
    roomId,
    messageId,
    messageText,
  });

  writeDB();

  return NextResponse.json({
    ok: true,
    messageId : messageId,
    message: "Message has been sent",
  });
};

export const DELETE = async (request: NextRequest) => {
  const payload = checkToken();

  if(!payload){
    return NextResponse.json(
      {
        ok: false,
        message: "Invalid token",
      },
      { status: 401 }
    );
  }

  const {role} = <Payload>payload;
  
  readDB();

  if(role !== "SUPER_ADMIN"){
    return NextResponse.json(
      {
        ok: false,
        message: "Invalid Token",
      },
      { status: 401 }
    );
  }

  const body = await request.json();
  const {messageId} = body;

  const foundIndexMessage = (<Database>DB).messages.findIndex((x) => x.messageId === messageId);
  if(foundIndexMessage === -1){
    return NextResponse.json(
      {
        ok: false,
        message: "Message is not found",
      },
      { status: 404 }
    );
  }

  (<Database>DB).messages.splice(foundIndexMessage, 1);


  writeDB();

  return NextResponse.json({
    ok: true,
    message: "Message has been deleted",
  });
};
