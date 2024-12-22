"use client";
import {
  conversationAtom,
  messageAtom,
  newContactmobileNumberAtom,
  updatedSelectedConversationSelector,
} from "@/recoil_store/src/atoms/atoms";
import { useSession } from "next-auth/react";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";

import { useWebSocketHandler } from "@/utils/webSocetConnection";
import { DisplayMessages } from "./displayMessages";
import { DialogBox } from "./dialogBox";
import { AddContact } from "./newContact";
import { useRef } from "react";
import { ChatRoomNavBar } from "./chatRoomNavBar";

export default function ChatRoom({ userId }: { userId: string }) {
  const conversation = useRecoilValue(conversationAtom);
  const socket = useWebSocketHandler();
  const [message, setMessage] = useRecoilState(messageAtom);

  const updatedSelectedConversation = useRecoilValue(
    updatedSelectedConversationSelector
  );
  const setNewContactMobileNumber = useSetRecoilState(
    newContactmobileNumberAtom
  );
  const addContactRef = useRef<HTMLDialogElement | null>(null);

  // useEffect(() => {}, []);
  return (
    <div className="w-full h-full flex p-2 flex-col bg-slate-400">
      <DialogBox dialogRef={addContactRef}>
        <div className="flex justify-center w-full h-full">
          <AddContact addContactRef={addContactRef} />
        </div>
      </DialogBox>

      <ChatRoomNavBar />

      {updatedSelectedConversation?.showAddContactUi && (
        <div className="top-[7%] w-full bg-slate-700 mt-2 p-2">
          <h2 className="w-full text-center">Not in Contacts</h2>

          <div className="flex bg-slate-400 p-2">
            <h2 id="participantNumber" className="flex-1 p-2">
              {updatedSelectedConversation.participantNumber}
            </h2>

            <button
              onClick={() => {
                const number =
                  document.getElementById("participantNumber")?.innerHTML;
                setNewContactMobileNumber(number || "");
                addContactRef.current?.showModal();
              }}
              className="bg-slate-200 p-2 rounded-lg"
            >
              add contact
            </button>
          </div>
        </div>
      )}

      <DisplayMessages />

      <div className="flex-none">
        <form
          className="flex w-full p-1 bg-slate-300 rounded-md gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            if (message && message.length > 0) {
              socket?.send(
                JSON.stringify({
                  messageType: "sendMessage",
                  messageData: {
                    messageContent: message,
                    conversationId: conversation?.conversation.conversation_id,
                    senderId: userId,
                    conversationParicipants:
                      conversation?.conversation.conversationParticipants,
                  },
                })
              );
            }
            const inputElement = document.getElementById(
              "messageText"
            ) as HTMLInputElement;
            inputElement.value = "";
          }}
          action=""
        >
          <input
            id="messageText"
            className="flex-1 rounded-md p-1"
            type="text"
            placeholder="message"
            onChange={(e) => {
              setMessage(e.target.value);
            }}
          />
          {/* <button>att</button>
          <input type="file" /> */}
          <button
            type="submit"
            className={`${
              (message === null || message === "") && "opacity-50"
            }`}
            disabled={!message}
          >
            send
          </button>
        </form>
      </div>
    </div>
  );
}

// {"message_id":"df7a8219-e8b6-4bc5-b827-f3eb8d531dff","conversationId":"321383d0-1a62-4bac-bd4b-8966f9674750","content":"hi there","createdAt":"2024-06-12T12:38:49.010Z","userName":"5ecebadc-e379-4e0b-8d80-63a343444ab5","messageSentBy":"5ecebadc-e379-4e0b-8d80-63a343444ab5"}
