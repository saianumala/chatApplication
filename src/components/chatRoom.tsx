"use client";
import {
  conversationAtom,
  messagesAtom,
  messageAtom,
  incomingCallAtom,
  videoCallInitiatedAtom,
  audioCallInitiatedAtom,
  videoCallAtom,
  audioCallAtom,
  callTypeAtom,
} from "@/recoil_store/src/atoms/atoms";
import { useSendMessage } from "@/utils/webSocketSendMessages";
import { useSession } from "next-auth/react";
import { useRef, useState } from "react";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";

import { useWebSocketHandler } from "@/utils/webSocetConnection";
import { initiateCall } from "@/utils/mediaSoupConnection";

export default function ChatRoom({ userId }: { userId: string }) {
  const conversation = useRecoilValue(conversationAtom);
  const messages = useRecoilValue(messagesAtom);
  const socket = useWebSocketHandler();
  const sendMessage = useSendMessage();
  const [message, setMessage] = useRecoilState(messageAtom);
  const selectedConversation = useRecoilValue(conversationAtom);
  const { data: session } = useSession();
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const callDialogRef = useRef<HTMLDialogElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const setIncomingCall = useSetRecoilState(incomingCallAtom);
  const setVideoCallInitiated = useSetRecoilState(videoCallInitiatedAtom);
  const setAudioCallInitiated = useSetRecoilState(audioCallInitiatedAtom);
  const setVideoCall = useSetRecoilState(videoCallAtom);
  const setAudioCall = useSetRecoilState(audioCallAtom);
  const setCallType = useSetRecoilState(callTypeAtom);
  console.log(
    selectedConversation?.conversation.conversation_id,
    "selectedConversation"
  );
  console.log(
    "selectedConversation",
    selectedConversation?.conversation.conversationParticipants
  );
  const participantNumbers =
    selectedConversation?.conversation.conversationParticipants
      .filter(
        (participant) =>
          participant.participantNumber !== session?.user.mobileNumber
      )
      .map((filteredParticipants) => filteredParticipants.participantNumber) ||
    [];

  return (
    <div className="w-full h-full flex p-2 flex-col bg-slate-400">
      <nav className="flex justify-between bg-slate-200 flex-none w-full h-[5%] p-2">
        <div>
          {selectedConversation?.conversation.conversationName
            ? selectedConversation?.conversation.conversationName
            : selectedConversation?.conversation.conversationParticipants.map(
                (participant) =>
                  participant.participantNumber !==
                    session?.user.mobileNumber && participant.participantNumber
              )}
        </div>

        <div>
          <button
            className="bg-blue-300"
            onClick={() => {
              setVideoCallInitiated(true);
              setVideoCall(true);
              setCallType("video");
              initiateCall(
                "video",
                socket,
                selectedConversation?.conversation.conversation_id || "",
                session?.user.mobileNumber || ""
              );
            }}
          >
            {" "}
            video call
          </button>
          <button
            className="bg-blue-300"
            onClick={() => {
              setAudioCallInitiated(true);
              setAudioCall(true);
              setCallType("audio");
              initiateCall(
                "audio",
                socket,
                selectedConversation?.conversation.conversation_id || "",
                session?.user.mobileNumber || ""
              );
            }}
          >
            {" "}
            AUDIO call
          </button>
        </div>
      </nav>

      <div className="flex-1 h-5/6 flex flex-col overflow-y-auto">
        {messages?.map((eachMessage) => {
          // console.log("message created at", eachMessage.mesageId);

          if (eachMessage?.messageSentBy === userId) {
            // console.log(eachMessage.createdAt);
            return (
              <div
                key={eachMessage.message_id}
                className="w-full flex justify-end"
              >
                <h4 className="m-2 p-2 rounded-t-md rounded-l-md bg-slate-200">
                  {eachMessage?.content}
                </h4>
                <span className="uppercase">{}</span>
              </div>
            );
          } else {
            return (
              <div
                key={eachMessage.message_id}
                className="w-full flex justify-start"
              >
                <h4 className="m-2 p-2  rounded-r-md rounded-t-md bg-slate-200">
                  {eachMessage?.content}
                </h4>
                <span className="uppercase">{}</span>
              </div>
            );
          }
        })}
      </div>
      <div className="flex-none">
        <div className="flex w-full p-1 bg-slate-300 rounded-md gap-3">
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
            className={`${
              (message === null || message === "") && "opacity-50"
            }`}
            disabled={!message}
            onClick={() => {
              // console.log(socket);
              if (message && message.length > 0) {
                socket?.send(
                  JSON.stringify({
                    messageType: "sendMessage",
                    messageData: {
                      messageContent: message,
                      conversationId:
                        conversation?.conversation.conversation_id,
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
              // socket?.send(
              //   JSON.stringify({
              //     type: "sendMessage",
              //     messageData: {
              //       messageContent: message,
              //       conversationId: conversation?.conversation.conversation_id,
              //       senderId: userId,
              //       conversationParicipants:
              //         conversation?.conversation.conversationParticipants,
              //     },
              //   })

              // );
              // setMessage("");
            }}
          >
            send
          </button>
        </div>
      </div>
    </div>
  );
}

// {"message_id":"df7a8219-e8b6-4bc5-b827-f3eb8d531dff","conversationId":"321383d0-1a62-4bac-bd4b-8966f9674750","content":"hi there","createdAt":"2024-06-12T12:38:49.010Z","userName":"5ecebadc-e379-4e0b-8d80-63a343444ab5","messageSentBy":"5ecebadc-e379-4e0b-8d80-63a343444ab5"}
