"use client";

import { useRouter } from "next/navigation";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import {
  conversationAtom,
  conversationsAtom,
  messagesAtom,
  socketAtom,
} from "@/recoil_store/src/atoms/atoms";
import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";

import { AddContact } from "./newContact";
import { AllContacts } from "./allcontacts";
import SearchContacts from "./searchContacts.";
import { GroupCreate } from "./groupCreate";
import { useSendMessage } from "@/utils/webSocketSendMessages";
import { useWebSocketHandler } from "@/utils/webSocetConnection";
import Button from "./button";

// todo - notifications
// todo - add otp based login along with password
// todo - make routes protected
// todo - add a mini sidebar or a three dot icon for settings and other functionalities
// todo - add redis pubsub and horizontally scale the website

export default function AllConversations(userID: any) {
  const { data: session } = useSession();
  const socket = useWebSocketHandler();
  const sendMessage = useSendMessage();
  const router = useRouter();
  const setMessages = useSetRecoilState(messagesAtom);
  const [selectedConversation, setselectedConversation] =
    useRecoilState(conversationAtom);
  const [conversations, setConversations] = useRecoilState(conversationsAtom);
  const contactsRef = useRef<HTMLDialogElement | null>(null);
  const addContactRef = useRef<HTMLDialogElement | null>(null);
  const searchRef = useRef<HTMLDialogElement | null>(null);
  const groupCreateRef = useRef<HTMLDialogElement | null>(null);
  const [loading, setLoading] = useState(true);
  console.log("new conversations", conversations);
  // console.log("userId in allConversations", userID);
  useEffect(() => {
    console.log("log inside effect");

    async function fetchConversation() {
      const conversationsResponse = await fetch(
        "api/conversation/allConversations"
      );
      const conversationData = await conversationsResponse.json();

      setConversations(conversationData.conversations);
      setLoading(false);
    }

    fetchConversation();
  }, []);
  // console.log("rendered");

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
    // if (socket) {
    //   socket?.send(
    //     JSON.stringify({
    //       type: "closeConversation",
    //       messageData: {
    //         messageContent: "conversationClosed",
    //         conversationId: selectedConversation?.conversation.conversation_id,
    //         senderId: session?.user.userId,
    //       },
    //     })
    //   );
    // }
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
    // if (socket) {
    //   socket.send(
    //     JSON.stringify({
    //       type: "openConversation",
    //       messageData: {
    //         messageContent: "conversationOpened",
    //         conversationId: conversationId,
    //         senderId: session?.user.userId,
    //       },
    //     })
    //   );
    // }
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
  if (loading) {
    return (
      <>
        <h1>loaing conversations</h1>
      </>
    );
  } else {
    return (
      <div className="w-full h-full p-2">
        <dialog
          className="backdrop:black/50 bg-black text-white  w-4/6 h-4/6"
          ref={addContactRef}
        >
          <AddContact addContactRef={addContactRef} />
        </dialog>
        <dialog className="w-2/4 h-1/4" ref={contactsRef}>
          <AllContacts contactsRef={contactsRef} />
        </dialog>
        <dialog className="w-2/4 h-1/4" ref={searchRef}>
          <SearchContacts searchRef={searchRef} />
        </dialog>
        <dialog className="w-2/4 h-2/4" ref={groupCreateRef}>
          <GroupCreate
            myNumber={session?.user?.mobileNumber!}
            groupCreateRef={groupCreateRef}
          />
        </dialog>

        <div className="flex flex-col h-full items-start">
          <div className="p-2 bg-slate-300 justify-center  flex gap-2 border-solid border-black border-2 rounded-md">
            <button
              onClick={() => addContactRef.current?.showModal()}
              className="outline-none flex-1 w-full"
            >
              new contact
            </button>
          </div>
          <input
            className="flex-none p-1 w-full"
            placeholder="search"
            type="search"
            onClick={() => searchRef.current?.showModal()}
          />
          <div className="flex-1 h-5/6 w-full">
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
                              {conversation.conversation.ReadStatus.length >
                                0 && (
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
          <div className="flex-none w-full">
            <button
              className="bg-slate-300 w-full p-1"
              onClick={() => {
                router.push("api/auth/signout");
              }}
            >
              logout
            </button>
            <button>+</button>
            <button>profile</button>
            <button>settings</button>
          </div>
        </div>
      </div>
    );
  }
}
