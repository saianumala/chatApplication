import {
  audioCallAtom,
  callAcceptedAtom,
  callTypeAtom,
  conversationAtom,
  conversationsAtom,
  incomingCallAtom,
  incomingCallMessageDataAtom,
  messagesAtom,
  myStreamAtom,
  remoteTracksAtom,
  rtcPeerConnectionInitiatedAtom,
  videoCallAtom,
  videoCallInitiatedAtom,
} from "@/recoil_store/src/atoms/atoms";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRecoilState, useSetRecoilState } from "recoil";

import { useRef } from "react";
// import { peerConnection } from "./webRtcConnection";
import {
  consumeData,
  createConsume,
  createRecvTransport,
  createSendTransport,
  requestTransports,
} from "./mediaSoupConnection";

function useWebSocketHandler(): WebSocket | null {
  const { data: session } = useSession();
  const setIncomingCall = useSetRecoilState(incomingCallAtom);
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const reconnectInterval = useRef<number | null>(null);
  const reconnectDelay = 5000;
  const setMessages = useSetRecoilState(messagesAtom);
  const setVideoCall = useSetRecoilState(videoCallAtom);
  const setAudioCall = useSetRecoilState(audioCallAtom);
  const setConversations = useSetRecoilState(conversationsAtom);
  const setIncomingCallMessageData = useSetRecoilState(
    incomingCallMessageDataAtom
  );
  const setCallType = useSetRecoilState(callTypeAtom);

  const setRemoteTracks = useSetRecoilState(remoteTracksAtom);
  const [callAccepted, setCallAccepted] = useRecoilState(callAcceptedAtom);
  const [myStream, setMyStream] = useRecoilState(myStreamAtom);
  const [videoCallInitiated, setVideoCallInitiated] = useRecoilState(
    videoCallInitiatedAtom
  );
  const [selectedConversation, setSelectedConversation] =
    useRecoilState(conversationAtom);
  const setRtcPeerConnectionInitiated = useSetRecoilState(
    rtcPeerConnectionInitiatedAtom
  );

  // const { incomingOffer, incomingAnswer, addIceCandidates } = peerConnection();
  console.log("websocketHandler");
  function shufflingConversations(messageData: any) {
    setConversations((prevConversations) => {
      console.log("inside setConversations");
      if (!prevConversations) {
        return [];
      } else {
        const updatedConversations = prevConversations.filter(
          (conversation) =>
            conversation.conversation.conversation_id !==
            messageData.conversationId
        );
        const movedConversation = prevConversations.find(
          (conv) =>
            conv.conversation.conversation_id === messageData.conversationId
        );
        return movedConversation
          ? [movedConversation, ...updatedConversations]
          : updatedConversations;
      }
    });
  }
  const selectedConversationRef = useRef(selectedConversation);

  useEffect(() => {
    selectedConversationRef.current = selectedConversation;
  }, [selectedConversation]);

  useEffect(() => {
    const connectWebSocket = () => {
      const newSocket = new WebSocket(
        `ws://localhost:8080/c?clientId=${session?.user.userId}`
      );

      newSocket.onopen = () => {
        // console.log("WebSocket connected");
        setSocket(newSocket);

        // Clear reconnection interval if the socket successfully connects
        if (reconnectInterval.current) {
          clearInterval(reconnectInterval.current);
          reconnectInterval.current = null;
        }
      };
      newSocket.onmessage = async (message) => {
        const messageData = JSON.parse(message.data);

        console.log(
          "messageType check inside websocketconnecion: ",
          messageData.messageType
        );
        console.log("message data: ", messageData);
        switch (messageData.messageType) {
          case "newMessage":
            setMessages((prev) =>
              prev
                ? [
                    ...prev,
                    {
                      message_id: messageData.outgoingMessage.message_id,
                      conversationId:
                        messageData.outgoingMessage.conversationId,
                      content: messageData.outgoingMessage.messagecontent,
                      createdAt: messageData.outgoingMessage.createdAt,
                      messageSentBy: messageData.outgoingMessage.messageSentBy,
                      ReadStatus: messageData.outgoingMessage.ReadStatus,
                    },
                  ]
                : [
                    {
                      message_id: messageData.outgoingMessage.message_id,
                      conversationId:
                        messageData.outgoingMessage.conversationId,
                      content: messageData.outgoingMessage.messagecontent,
                      createdAt: messageData.outgoingMessage.createdAt,
                      messageSentBy: messageData.outgoingMessage.messageSentBy,
                      ReadStatus: messageData.outgoingMessage.ReadStatus,
                    },
                  ]
            );
            shufflingConversations(messageData);
            break;
          case "unreadMessage":
            shufflingConversations(messageData);
            break;
          // case "peerConnectionOffer":
          //   setRtcPeerConnectionInitiated(true);
          //   setIncomingCall(true);

          //   incomingOffer(
          //     messageData,
          //     session?.user?.mobileNumber,
          //     newSocket,
          //     callAccepted
          //   );
          //   break;
          // case "peerConnectionAnswer":
          //   incomingAnswer(messageData);
          //   break;
          // case "iceCandidate":
          //   addIceCandidates(messageData);
          //   break;
          case "routerCapabilities":
            await requestTransports(
              messageData,
              newSocket,
              session?.user?.mobileNumber || ""
            );
            break;
          case "incomingCall":
            console.log("incoming call: ", messageData);
            const callType: string = messageData.callType;

            if (callType === "video") {
              setCallType("video");
              console.log("inside calltype video");
              setVideoCall(true);
              setIncomingCall(true);
              setIncomingCallMessageData(messageData);
            } else if (callType === "audio") {
              setIncomingCallMessageData(messageData);
              setCallType("audio");

              setAudioCall(true);
            }

            break;
          case "sendTransport":
            await createSendTransport(
              messageData,
              newSocket,
              session?.user?.userId || "",
              selectedConversationRef?.current?.conversation.conversation_id ||
                ""
            );
            break;
          case "receiveTransport":
            await createRecvTransport(
              messageData,
              newSocket,
              session?.user?.userId || "",
              selectedConversationRef?.current?.conversation.conversation_id ||
                ""
            );
            break;
          case "newProducer":
            await createConsume(
              messageData,
              newSocket,
              session?.user.userId || "",
              selectedConversationRef.current?.conversation.conversation_id ||
                ""
            );
            // setVideoCallInitiated(false);
            // setCallAccepted(true);
            break;
          case "producersToConsume":
            await createConsume(
              messageData,
              newSocket,
              session?.user.userId || "",
              selectedConversationRef.current?.conversation.conversation_id ||
                ""
            );
            break;
          case "consumerCreated":
            await consumeData(messageData, setRemoteTracks);
            break;
          case "leftTheCall":
            console.log("remote user id:", messageData.userId);
            const userId: string = messageData.userId;
            const remoteMediaStreamElement = document.getElementById(
              userId
            ) as HTMLVideoElement;
            console.log(
              "Remotemedia stream element:",
              remoteMediaStreamElement
            );
            remoteMediaStreamElement?.remove();
            setRemoteTracks((prevTracks) => {
              prevTracks &&
                prevTracks
                  .filter(
                    (track) => track.remoteStreamerId === messageData.userID
                  )
                  .forEach((track) => track.track.stop());

              return (
                prevTracks?.filter(
                  (track) => track.remoteStreamerId !== messageData.userId
                ) || null
              );
            });
            break;
        }
      };
      newSocket.onclose = () => {
        const tracks = myStream?.getTracks();
        tracks?.forEach((track) => track.stop());
        setMyStream(null);
        setSelectedConversation(null);
        setIncomingCall(false);
        setCallAccepted(false);
        setVideoCallInitiated(false);
        setRemoteTracks(null);
        console.log("Connection closed, attempting to reconnect...");
        if (!reconnectInterval.current) {
          reconnectInterval.current = window.setInterval(
            connectWebSocket,
            reconnectDelay
          );
        }
      };

      return newSocket;
    };

    // Initiate connection
    connectWebSocket();

    // Cleanup on component unmount
    return () => {
      if (reconnectInterval.current) {
        clearInterval(reconnectInterval.current);
      }
      socket?.close();
    };
  }, []);

  return socket;
}

export { useWebSocketHandler };
