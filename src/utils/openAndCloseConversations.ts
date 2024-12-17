export function closeConversation({
  socket,
  userId,
  selectedConversation,
}: {
  socket: WebSocket | null;
  userId: string | undefined;

  selectedConversation: {
    conversation: {
      DateModified: Date;
      conversationParticipants: {
        id: string;
        conversationId: string;
        participantNumber: string;
      }[];
      conversation_id: string;
      conversationName: string | null;
      createdAt: Date;
      ReadStatus: {
        id: string;
      }[];
      type: string;
    };
  } | null;
}) {
  socket?.send(
    JSON.stringify({
      messageType: "closeConversation",
      messageData: {
        messageContent: "conversationClosed",
        conversationId: selectedConversation?.conversation.conversation_id,
        senderId: userId,
      },
    })
  );
}
export function openConversation({
  socket,
  conversationId,
  userId,
}: {
  conversationId: string;
  socket: WebSocket | null;
  userId: string | undefined;
}) {
  socket?.send(
    JSON.stringify({
      messageType: "openConversation",
      messageData: {
        messageContent: "conversationOpened",
        conversationId: conversationId,
        senderId: userId,
      },
    })
  );
}
