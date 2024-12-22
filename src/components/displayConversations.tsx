import {
  contactsAtom,
  conversationAtom,
  conversationsAtom,
  messagesAtom,
} from "@/recoil_store/src/atoms/atoms";
import {
  closeConversation,
  handleChat,
  openConversation,
} from "@/utils/handlerFunctions";
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
  const [contacts, setContacts] = useRecoilState(contactsAtom);

  const [conversations, setConversations] = useRecoilState(conversationsAtom);
  console.log("displayConversation rendered");
  useEffect(() => {
    console.log("log inside effect");

    function fetchConversations() {
      fetch("api/conversation/allConversations")
        .then((conversationsResponse) => conversationsResponse.json())
        .then((conversationData) => {
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
                        return (
                          conversationParticipant.participantNumber !==
                          session?.user.mobileNumber
                        );
                      }
                    );
                  const otherParticipantContact =
                    conversationData.contacts.find((contact: any) => {
                      return (
                        contact.mobileNumber ===
                        otherParticipant[0].participantNumber
                      );
                    });
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
            // console.log("updated conversations: ", newConversations);

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
  }, [session, contacts]);

  // console.log("new conversaions: ", conversations);

  return (
    <div className="flex-1 h-full w-full overflow-y-auto">
      {conversations ? (
        conversations.map((conversation) => {
          return (
            <div
              className={` w-full p-2 hover:cursor-pointer active:scale-95 transition-all`}
              onClick={async () => {
                const newSelectedConversationData = await handleChat({
                  chosenConversation: conversation.conversation,
                  selectedConversationId:
                    selectedConversation?.conversation.conversation_id || null,
                  socket: socket,
                  userId: session?.user.userId || "",
                });
                console.log(newSelectedConversationData.conversation.messages);
                setselectedConversation({
                  conversation: newSelectedConversationData.conversation,
                });
                setMessages(newSelectedConversationData.conversation.messages);
              }}
              key={conversation.conversation.conversation_id}
            >
              <div
                className={`p-2 w-full bg-slate-300 flex gap-2 border-solid border-black border-2 justify-between rounded-md`}
              >
                <button className="w-full text-start">
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
                  <span className="w-[25px] text-center animate-pulse rounded-full bg-slate-400">
                    {conversation.conversation.ReadStatus.length > 100
                      ? "99+"
                      : conversation.conversation.ReadStatus.length}
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
