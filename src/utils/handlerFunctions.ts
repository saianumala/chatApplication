export function closeConversation({
  socket,
  userId,
  selectedConversationId,
}: {
  socket: WebSocket | null;
  userId: string | undefined;

  selectedConversationId: string | null;
}) {
  socket?.send(
    JSON.stringify({
      messageType: "closeConversation",
      messageData: {
        messageContent: "conversationClosed",
        conversationId: selectedConversationId,
        senderId: userId,
      },
    })
  );
}
export function openConversation({
  socket,
  openConversationId,
  userId,
}: {
  openConversationId: string;
  socket: WebSocket | null;
  userId: string | undefined;
}) {
  socket?.send(
    JSON.stringify({
      messageType: "openConversation",
      messageData: {
        messageContent: "conversationOpened",
        conversationId: openConversationId,
        senderId: userId,
      },
    })
  );
}
export async function handleChat({
  chosenConversation,
  socket,
  userId,
  selectedConversationId,
}: {
  chosenConversation: {
    DateModified: Date;
    conversationParticipants: {
      id: string;
      conversationId: string;
      participantNumber: string;
    }[];
    conversation_id: string;
    ReadStatus: {
      id: string;
    }[];
    conversationName: string | null;
    createdAt: Date;
    type: string;
  };
  socket: WebSocket | null;
  userId: string;
  selectedConversationId: string | null;
}) {
  // console.log("conversation", conversation);
  const conversationMessagesResponse = await fetch(
    `api/conversation/getConversation?conversationId=${chosenConversation.conversation_id}`
  );
  const conversationMessagesData = await conversationMessagesResponse.json();
  closeConversation({
    socket: socket,
    selectedConversationId: selectedConversationId,
    userId: userId,
  });
  openConversation({
    openConversationId: chosenConversation.conversation_id,
    socket: socket,
    userId: userId,
  });
  return conversationMessagesData;
}
