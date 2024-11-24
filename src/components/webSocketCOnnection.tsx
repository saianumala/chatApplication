"use client";
import { Ws } from "@/components/websocket";
// import { getServerSession } from "next-auth";
// import { redirect } from "next/navigation";
export function WebSocketConnection({ userId }: { userId: string }) {
  return (
    <>
      <Ws userId={userId} />
    </>
  );
}

// when the user opens the chat app and is logged in make a websocket connection, if not logged in, make them login and make a websocket connection
// write backend code to get users as the user searches, when i select the user start the conversation and
