import {
  conversationAtom,
  conversationsAtom,
  messagesAtom,
} from "@/recoil_store/src/atoms/atoms";
import { useWebSocketHandler } from "@/utils/webSocetConnection";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRecoilState, useSetRecoilState } from "recoil";

export function DisplayConversations() {
  const { data: session } = useSession();
  const socket = useWebSocketHandler();
  const [loading, setLoading] = useState(true);

  const setMessages = useSetRecoilState(messagesAtom);
  const [selectedConversation, setselectedConversation] =
    useRecoilState(conversationAtom);
  const [conversations, setConversations] = useRecoilState(conversationsAtom);
  useEffect(() => {
    console.log("log inside effect");

    async function fetchConversations() {
      const conversationsResponse = await fetch(
        "api/conversation/allConversations"
      );
      const conversationData = await conversationsResponse.json();

      setConversations(conversationData.conversations);
      setLoading(false);
    }

    fetchConversations();
  }, []);
  function closeConversation() {
    socket?.send(
      JSON.stringify({
        messageType: "closeConversation",
        messageData: {
          messageContent: "conversationClosed",
          conversationId: selectedConversation?.conversation.conversation_id,
          senderId: session?.user.userId,
        },
      })
    );
  }
  function openConversation(conversationId: string) {
    socket?.send(
      JSON.stringify({
        messageType: "openConversation",
        messageData: {
          messageContent: "conversationOpened",
          conversationId: conversationId,
          senderId: session?.user.userId,
        },
      })
    );
  }
  async function handleChat(conversation: {
    conversation: {
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
    };
  }) {
    // console.log("conversation", conversation);
    const conversationMessagesResponse = await fetch(
      `api/conversation/getConversation?conversationId=${conversation.conversation.conversation_id}`
    );
    const conversationMessagesData = await conversationMessagesResponse.json();
    closeConversation();
    // console.log("previous selection", selectedConversation);
    openConversation(conversation.conversation.conversation_id);
    setselectedConversation(conversation);
    // console.log("new selectedConversation", selectedConversation);
    setMessages(conversationMessagesData.conversationMessages.messages);
  }
  return (
    <div className="flex-1 h-5/6 w-full overflow-y-auto">
      {conversations ? (
        conversations.map((conversation) => {
          return (
            <div
              className="w-full p-2"
              onClick={() => handleChat(conversation)}
              key={conversation.conversation.conversation_id}
            >
              {conversation.conversation.conversationName ? (
                <div
                  className={`p-2 w-full bg-slate-300 flex gap-2 border-solid border-black border-2 rounded-md justify-center`}
                >
                  <button className="flex-1">
                    {conversation.conversation.conversationName}
                  </button>
                  {conversation.conversation.ReadStatus.length > 0 && (
                    <span className="text-right bg-slate-400 rounded-full p-1">
                      {conversation.conversation.ReadStatus.length}
                    </span>
                  )}
                </div>
              ) : (
                conversation.conversation.conversationParticipants.map(
                  (conversationParticipant) =>
                    conversationParticipant.participantNumber !==
                      session?.user.mobileNumber && (
                      <div
                        key={conversationParticipant.id}
                        className="p-2 bg-slate-300 justify-center  flex gap-2 border-solid border-black border-2 rounded-md"
                      >
                        <button className="outline-none flex-1 w-full">
                          {conversationParticipant.participantNumber}{" "}
                        </button>
                        {conversation.conversation.ReadStatus.length > 0 && (
                          <span className="text-right bg-slate-400 rounded-full p-1">
                            {conversation.conversation.ReadStatus.length}
                          </span>
                        )}
                      </div>
                    )
                )
              )}
            </div>
          );
        })
      ) : (
        <h3>No Conversations</h3>
      )}
    </div>
  );
}
