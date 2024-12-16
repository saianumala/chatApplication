import {
  callAcceptedAtom,
  callDeclinedAtom,
  conversationAtom,
  incomingCallAtom,
  incomingCallMessageDataAtom,
  myStreamAtom,
  remoteMediaStreamsSelector,
  remoteTracksAtom,
  videoCallAtom,
  videoCallInitiatedAtom,
} from "@/recoil_store/src/atoms/atoms";
import { clearMediaStream, getMediaStream } from "@/utils/getMediaStream";
import { acceptIncomingCall } from "@/utils/mediaSoupConnection";
import { useWebSocketHandler } from "@/utils/webSocetConnection";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import { clearMediaSoupConnection } from "@/utils/mediaSoupConnection";

export default function VideoCall() {
  const [incomingCall, setIncomingCall] = useRecoilState(incomingCallAtom);
  const [callAccepted, setCallAccepted] = useRecoilState(callAcceptedAtom);
  const [videoCallInitiated, setVideoCallInitiated] = useRecoilState(
    videoCallInitiatedAtom
  );
  const [videoCall, setVideoCall] = useRecoilState(videoCallAtom);
  const [callEnded, setCallEnded] = useState(false);
  const [callDeclined, setCallDeclined] = useRecoilState(callDeclinedAtom);
  const streamerMediaStreams = useRecoilValue(remoteMediaStreamsSelector);
  // const [myStream, setMyStream] = useRecoilState(myStreamAtom);
  let myStream: MediaStream | null = null;
  const [remoteStreamTracks, setRemoteStreamTracks] =
    useRecoilState(remoteTracksAtom);
  const { data: session } = useSession();
  const socket = useWebSocketHandler();
  const selectedConversation = useRecoilValue(conversationAtom);
  const incomingCallMessageData = useRecoilValue(incomingCallMessageDataAtom);
  useEffect(() => {
    console.log("video call: ", videoCall);
    console.log("streamertracks before the call started: ", remoteStreamTracks);
    console.log("reomote streams: ", streamerMediaStreams);
    if (videoCallInitiated || incomingCall || callAccepted) {
      if (!myStream) {
        console.log("creating my stream");

        getMediaStream("VIDEO")
          .then((stream) => {
            myStream = stream;
            const myStreamVideoElement = document.getElementById(
              "myStreamVideoElement"
            ) as HTMLVideoElement;
            if (
              myStreamVideoElement &&
              myStreamVideoElement.srcObject === null
            ) {
              myStreamVideoElement.srcObject = myStream;
            }
          })
          .catch((error) => console.error(error));
      }
      console.log("mystream inside videocall: ", myStream);
      const myStreamVideoElement = document.getElementById(
        "myStreamVideoElement"
      ) as HTMLVideoElement;
      if (myStreamVideoElement && myStreamVideoElement.srcObject === null) {
        myStreamVideoElement.srcObject = myStream;
      }
    }

    if (remoteStreamTracks && remoteStreamTracks.length > 0) {
      if (videoCallInitiated) {
        console.log("using stream:", myStream);

        setVideoCallInitiated(false);
        setCallAccepted(true);
      } else if (incomingCall) {
        console.log("using stream:", myStream);

        setIncomingCall(false);
        setCallAccepted(true);
      } else if (callAccepted) {
        console.log("remotemediastreams: ", streamerMediaStreams);
        const remoteStreamElements =
          document.getElementById("remoteVideoDiv")?.childNodes;
        console.log("remoteStreamElements:", remoteStreamElements);

        console.log("using stream:", myStream);
        streamerMediaStreams?.map((remoteMediastream) => {
          if (remoteMediastream) {
            const videoElement = document.getElementById(
              remoteMediastream.remoteStreamerId
            ) as HTMLVideoElement;
            if (!videoElement) {
              console.log("remoteMediastream ", streamerMediaStreams.length);
              const remoteVideoElement = document.createElement("video");
              remoteVideoElement.autoplay = true;
              remoteVideoElement.id = remoteMediastream.remoteStreamerId;
              remoteVideoElement.style.width = `${
                streamerMediaStreams.length === 1
                  ? "100%"
                  : streamerMediaStreams.length === 2
                  ? "48%"
                  : streamerMediaStreams.length === 3
                  ? "33.33%"
                  : "400px"
              }`;
              remoteVideoElement.style.height = `${
                streamerMediaStreams.length === 1
                  ? "100%"
                  : streamerMediaStreams.length === 2
                  ? "100%"
                  : streamerMediaStreams.length === 3
                  ? "33.33%"
                  : "400px"
              }`;
              remoteVideoElement.style.objectFit = "cover";
              const remoteVideoDiv = document.getElementById(
                "remoteVideoDiv"
              ) as HTMLDivElement;
              if (remoteVideoElement.srcObject === null) {
                remoteVideoElement.srcObject = remoteMediastream.mediaStream;
              }
              console.log("remoteMediaStream: ", remoteMediastream);
              console.log("remoteVideoElement", remoteVideoElement);
              console.log("remoteVideoDiv", remoteVideoDiv);
              remoteVideoDiv.appendChild(remoteVideoElement);
            }
          } else {
            console.log("remote mediastream not found");
          }
        });
      }
    }
  }, [streamerMediaStreams, videoCallInitiated, incomingCall, callAccepted]);
  useEffect(() => {
    if (callEnded) {
      console.log("clearing mystream tracks");
      myStream?.getTracks().forEach((track) => track.stop());
      myStream = null;
      clearMediaStream();
      setVideoCallInitiated(false);
      setIncomingCall(false);
      setCallAccepted(false);

      setVideoCall(false);
    }
  }, [callEnded]);
  return (
    <>
      <div className="w-full h-full">
        {videoCallInitiated && (
          <div
            id="myStreamDiv"
            className="relative w-full h-full border-red-300 border-solid border-2"
          >
            <video
              playsInline
              autoPlay
              muted
              className="w-full h-full object-cover"
              id="myStreamVideoElement"
            ></video>
            <div className="absolute transform -translate-x-1/2 left-2/4 bottom-1/4">
              {callDeclined && (
                <span className="text-white">call declined. close</span>
              )}
              <button
                onClick={() => {
                  clearMediaSoupConnection(
                    socket,
                    session?.user.userId || ""
                    // setMyStream
                  );
                  setCallEnded(true);
                  setCallDeclined(false);
                }}
                className="bg-red-700 p-2 rounded-lg"
              >
                {callDeclined ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    height="24px"
                    viewBox="0 -960 960 960"
                    width="24px"
                    fill="#e8eaed"
                  >
                    <path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z" />
                  </svg>
                ) : (
                  "end"
                )}
              </button>
            </div>
          </div>
        )}
        {incomingCall && (
          <div
            id="myStream"
            className="relative w-full h-full bg-black border-red-300 border-solid border-2"
          >
            <video
              playsInline
              autoPlay
              muted
              className="w-full h-full bg-blue-300 z-10 object-cover"
              id="myStreamVideoElement"
            ></video>
            {/*  myvideo display */}
            <div className="absolute bottom-1 left-1/2 bg-gray-300 transform -translate-x-1/2 z-10">
              <button
                onClick={() => {
                  setCallEnded(false);
                  acceptIncomingCall(
                    incomingCallMessageData,
                    socket,
                    session?.user.mobileNumber || ""
                  );

                  setIncomingCall(false);
                  setCallAccepted(true);
                }}
                className="bg-green-700 p-2 m-2"
              >
                accept
              </button>
              <button
                onClick={() => {
                  // clearMediaSoupConnection(socket);
                  socket?.send(
                    JSON.stringify({
                      messageType: "callDeclined",
                      messageData: {
                        conversationId: incomingCallMessageData?.conversationId,
                        userId: session?.user.userId,
                      },
                    })
                  );
                  setCallEnded(true);
                  // setMyStream((prevTracks) => {
                  //   prevTracks?.getTracks().forEach((track) => track.stop());
                  //   return null;
                  // });
                }}
                className="bg-red-700 p-2 m-2"
              >
                decline
              </button>
            </div>
          </div>
        )}

        {callAccepted && (
          <div className="relative w-full h-full flex gap-2">
            <div
              id="myStream"
              className={` ${
                streamerMediaStreams && streamerMediaStreams.length > 0
                  ? "absolute sm:w-2/6 w-2/4"
                  : "w-full h-full border-red-300 border-solid border-2"
              } `}
            >
              <video
                playsInline
                autoPlay
                muted
                className="w-full h-full object-cover"
                id="myStreamVideoElement"
              ></video>
              {/*  myvideo display */}
            </div>
            <div
              id="remoteVideoDiv"
              className={`${
                !streamerMediaStreams || streamerMediaStreams.length === 0
                  ? "hidden"
                  : "w-full justify-evenly flex  h-full  border-red-800 border-solid border-2"
              }  `}
            ></div>
            <div className="absolute transform -translate-x-1/2 left-2/4 bottom-1/4">
              <button
                onClick={() => {
                  clearMediaSoupConnection(
                    socket,
                    session?.user.userId || ""
                    // setMyStream
                  );
                  streamerMediaStreams?.forEach(
                    (
                      stream: {
                        remoteStreamerId: string;
                        mediaStream: MediaStream;
                      } | null
                    ) => {
                      stream &&
                        stream.mediaStream
                          .getTracks()
                          .forEach((track) => track.stop());
                      const remoteMediaStreamElement =
                        stream?.remoteStreamerId &&
                        (document.getElementById(
                          stream?.remoteStreamerId
                        ) as HTMLVideoElement);

                      remoteMediaStreamElement &&
                        remoteMediaStreamElement?.remove();
                    }
                  );

                  setRemoteStreamTracks(
                    (
                      prevTracks:
                        | {
                            remoteStreamerId: string;
                            kind: string;
                            track: MediaStreamTrack;
                          }[]
                        | null
                    ) => {
                      prevTracks?.forEach((remoteTrack) => {
                        remoteTrack.track.stop();
                      });
                      return null;
                    }
                  );
                  setCallEnded(true);

                  // console.log(
                  //   "myStream after clearing everything is:",
                  //   myStream
                  // );
                }}
                className="bg-red-700 p-2 rounded-lg"
              >
                end
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
