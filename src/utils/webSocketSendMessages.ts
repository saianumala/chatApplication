"use client";
import { useWebSocketHandler } from "./webSocetConnection";
import { useEffect } from "react";

export function useSendMessage() {
  const socket = useWebSocketHandler();
  return ({
    messageType,
    messageData,
  }: {
    messageType: string;
    messageData: any;
  }) => {
    if (socket) {
      socket.send(
        JSON.stringify({
          messageType: messageType,
          messageData: messageData,
        })
      );
    }
  };
}
