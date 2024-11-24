"use client";
import { useRecoilState } from "recoil";
import { conversationAtom } from "@/recoil_store/src/atoms/atoms";

import ChatRoom from "../components/chatRoom";
import AllConversations from "./allConversations";
import // useWebSocketHandler,
// useWebSocketConnection,
"@/utils/webSocetConnection";
import { useEffect } from "react";

export function Ws({ userId }: { userId: string }) {
  // const socket = useWebSocketConnection();

  // useEffect(() => {
  //   console.log("userId: is", userId);

  //   const newSocket = new WebSocket(`ws://localhost:8080/c?clientId=${userId}`);

  //   newSocket.onopen = () => {
  //     console.log("Connection established");
  //   };

  //   newSocket.onmessage = (message) => {
  //     console.log(message.data);
  //     console.log("Message data:", message.data);

  //     const messageData = JSON.parse(message.data);

  //     console.log("message type ", messageData.messageType);
  //     setConversations((prevConversations) => {
  //       console.log("inside setConversations");
  //       if (!prevConversations) {
  //         return [];
  //       } else {
  //         const updatedConversations = prevConversations.filter(
  //           (conversation) =>
  //             conversation.conversation.conversation_id !==
  //             messageData.conversationId
  //         );
  //         const movedConversation = prevConversations.find(
  //           (conv) =>
  //             conv.conversation.conversation_id === messageData.conversationId
  //         );
  //         return movedConversation
  //           ? [movedConversation, ...updatedConversations]
  //           : updatedConversations;
  //       }
  //     });
  //     if (messageData.messageType === "newMessage") {
  //       console.log("inside type new message");
  //       setMessages((prev) =>
  //         prev
  //           ? [
  //               ...prev,
  //               {
  //                 message_id: messageData.outgoingMessage.message_id,
  //                 conversationId: messageData.outgoingMessage.conversationId,
  //                 content: messageData.outgoingMessage.messagecontent,
  //                 createdAt: messageData.outgoingMessage.createdAt,
  //                 messageSentBy: messageData.outgoingMessage.messageSentBy,
  //                 ReadStatus: messageData.outgoingMessage.ReadStatus,
  //               },
  //             ]
  //           : [
  //               {
  //                 message_id: messageData.outgoingMessage.message_id,
  //                 conversationId: messageData.outgoingMessage.conversationId,
  //                 content: messageData.outgoingMessage.messagecontent,
  //                 createdAt: messageData.outgoingMessage.createdAt,
  //                 messageSentBy: messageData.outgoingMessage.messageSentBy,
  //                 ReadStatus: messageData.outgoingMessage.ReadStatus,
  //               },
  //             ]
  //       );
  //       // console.log(socketMessage);
  //     } else if (messageData.messageType === "unreadMessage") {
  //       console.log("changing conversation list");
  //     }
  //   };

  //   newSocket.onclose = () => {
  //     console.log("socket connection closed");
  //     setSocket(null);
  //     setSelectedConversation(null);
  //   };

  //   setSocket(newSocket);
  // }, []);

  return <></>;
}
