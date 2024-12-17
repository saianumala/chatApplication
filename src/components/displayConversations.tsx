import {
  contactsAtom,
  conversationAtom,
  conversationsAtom,
  messagesAtom,
} from "@/recoil_store/src/atoms/atoms";
import {
  closeConversation,
  openConversation,
} from "@/utils/openAndCloseConversations";
import { useWebSocketHandler } from "@/utils/webSocetConnection";
import { error } from "console";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useRecoilState, useSetRecoilState } from "recoil";

export function DisplayConversations() {
  const { data: session } = useSession();
  const socket = useWebSocketHandler();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  console.log("session: ", session);
  const setMessages = useSetRecoilState(messagesAtom);
  // const [contacts, setContacts] = useRecoilState(contactsAtom);
  const [selectedConversation, setselectedConversation] =
    useRecoilState(conversationAtom);
  const [conversations, setConversations] = useRecoilState(conversationsAtom);
  useEffect(() => {
    console.log("log inside effect");

    function fetchConversations() {
      fetch("api/conversation/allConversations")
        .then((conversationsResponse) => conversationsResponse.json())
        .then((conversationData) => {
          console.log("conversationData:", conversationData.conversations);
          console.log("session: ", session);
          setConversations(() => {
            const newConversations = conversationData.conversations.map(
              (conversation: any) => {
                if (
                  conversation.conversation.conversationParticipants.length ===
                  2
                ) {
                  const otherParticipant =
                    conversation.conversation.conversationParticipants.filter(
                      (conversationParticipant: any) => {
                        // console.log(
                        //   "conversationParticipant.participantNumber: ",
                        //   conversationParticipant.participantNumber
                        // );
                        console.log(session);
                        console.log(
                          "session?.user.mobileNumber:",
                          session?.user.mobileNumber
                        );
                        return (
                          conversationParticipant.participantNumber !==
                          session?.user.mobileNumber
                        );
                      }
                    );
                  console.log(otherParticipant);
                  const otherParticipantContact =
                    conversationData.contacts.find((contact: any) => {
                      // console.log("mobileNumber: ", contact.mobileNumber);
                      // console.log(
                      //   "otherParticipant[0].participantNumber:",
                      //   otherParticipant[0].participantNumber
                      // );

                      return (
                        contact.mobileNumber ===
                        otherParticipant[0].participantNumber
                      );
                    });
                  console.log(otherParticipantContact);
                  return {
                    conversation: {
                      ...conversation.conversation,
                      conversationName: otherParticipantContact?.contactName,
                    },
                  };
                }
                return { conversation: { ...conversation.conversation } };
              }
            );
            console.log("updated conversations: ", newConversations);

            return newConversations;
          });
          // setConversations(conversationData.conversations);
          // setContacts(conversationData.contacts);
          setLoading(false);
        })
        .catch((error) => console.error(error));
    }
    if (session) {
      fetchConversations();
    } else {
      router.push("/user/signin");
    }
  }, [session]);

  async function handleChat(chosenConversation: {
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
  }) {
    // console.log("conversation", conversation);
    const conversationMessagesResponse = await fetch(
      `api/conversation/getConversation?conversationId=${chosenConversation.conversation_id}`
    );
    const conversationMessagesData = await conversationMessagesResponse.json();
    closeConversation({
      socket: socket,
      selectedConversation: selectedConversation,
      userId: session?.user.userId,
    });
    openConversation({
      conversationId: chosenConversation.conversation_id,
      socket: socket,
      userId: session?.user.userId,
    });
    console.log("selected conversation: ", chosenConversation);
    setselectedConversation({ conversation: chosenConversation });
    setMessages(conversationMessagesData.conversationMessages.messages);
  }
  console.log("new conversaions: ", conversations);

  return (
    <div className="flex-1 h-full w-full overflow-y-auto">
      {conversations ? (
        conversations.map((conversation) => {
          return (
            <div
              className="w-full p-2"
              onClick={() => handleChat(conversation.conversation)}
              key={conversation.conversation.conversation_id}
            >
              <div
                className={`p-2 w-full bg-slate-300 flex gap-2 border-solid border-black border-2 rounded-md justify-center`}
              >
                <button className="flex-1">
                  {conversation.conversation.conversationName
                    ? conversation.conversation.conversationName
                    : conversation.conversation.conversationParticipants.map(
                        (participant) => {
                          if (
                            participant.participantNumber !==
                            session?.user.mobileNumber
                          ) {
                            return participant.participantNumber;
                          }
                        }
                      )}
                </button>
                {conversation.conversation.ReadStatus.length > 0 && (
                  <span className="text-right bg-slate-400 rounded-full p-1">
                    {conversation.conversation.ReadStatus.length}
                  </span>
                )}
              </div>
            </div>
          );
        })
      ) : (
        <h3>No Conversations</h3>
      )}
    </div>
  );
}
