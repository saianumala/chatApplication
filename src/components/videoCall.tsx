import {
  callAcceptedAtom,
  conversationAtom,
  incomingCallAtom,
  incomingCallMessageDataAtom,
  myStreamAtom,
  remoteMediaStreamsSelector,
  remoteTracksAtom,
  videoCallAtom,
  videoCallInitiatedAtom,
} from "@/recoil_store/src/atoms/atoms";
import { getMediaStream } from "@/utils/getMediaStream";
import { acceptIncomingCall } from "@/utils/mediaSoupConnection";
import { useWebSocketHandler } from "@/utils/webSocetConnection";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import { clearMediaSoupConnection } from "@/utils/mediaSoupConnection";
import { log } from "console";

export default function VideoCall() {
  const [incomingCall, setIncomingCall] = useRecoilState(incomingCallAtom);
  const [callAccepted, setCallAccepted] = useRecoilState(callAcceptedAtom);
  const [videoCallInitiated, setVideoCallInitiated] = useRecoilState(
    videoCallInitiatedAtom
  );
  const [videoCall, setVideoCall] = useRecoilState(videoCallAtom);
  const [callEnded, setCallEnded] = useState(false);
  const streamerMediaStreams = useRecoilValue(remoteMediaStreamsSelector);
  const [myStream, setMyStream] = useRecoilState(myStreamAtom);
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
        const myStreamVideoElement = document.getElementById(
          "myStreamVideoElement"
        ) as HTMLVideoElement;
        getMediaStream("VIDEO").then((stream) => {
          if (
            stream &&
            myStreamVideoElement &&
            myStreamVideoElement?.srcObject === null
          ) {
            myStreamVideoElement.srcObject = stream;
          }
          setMyStream(stream);
        });
      } else if (myStream) {
        const myStreamVideoElement = document.getElementById(
          "myStreamVideoElement"
        ) as HTMLVideoElement;
        if (myStreamVideoElement && myStreamVideoElement.srcObject === null) {
          myStreamVideoElement.srcObject = myStream;
        }
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
        const myStreamVideoElement = document.getElementById(
          "myStreamVideoElement"
        ) as HTMLVideoElement;
        // if (myStreamVideoElement && myStreamVideoElement.srcObject === null) {
        //   getMediaStream("VIDEO").then((stream) => {
        //     myStreamVideoElement.srcObject = stream;
        //   });
        // }
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
              remoteVideoElement.style.width = "400px";
              remoteVideoElement.style.height = "400px";
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
      // console.log("clearing tracks");
      // console.log("before clearing tracks: ", myStream?.getTracks());
      // console.log("video call:", videoCall);
      // console.log("incomingCall:", incomingCall);
      // console.log("videoCallInitiated:", videoCallInitiated);
      // const tracks = myStream?.getTracks();
      // tracks && tracks.map((tracks) => tracks.stop());
      // setMyStream(null);
      setMyStream((mediastream) => {
        console.log("clearing tracks: ", mediastream?.getTracks());
        mediastream &&
          mediastream?.getTracks().forEach((track) => track.stop());
        console.log("after clearing tracks: ", mediastream?.getTracks());

        return null;
      });
      // myStreamVideoElement.srcObject && (myStreamVideoElement.srcObject = null);
      setVideoCallInitiated(false);
      setIncomingCall(false);
      setCallAccepted(false);

      setVideoCall(false);
    }
  }, [callEnded]);
  return (
    <>
      <div className="max-w-screen-sm max-h-max">
        {videoCallInitiated && (
          <div
            id="myStreamDiv"
            className="relative w-full h-full  border-red-300 border-solid border-2"
          >
            <video
              playsInline
              autoPlay
              className="bg-slate-300 w-full"
              id="myStreamVideoElement"
            ></video>
            <div className="absolute transform -translate-x-1/2 left-2/4 bottom-1/4">
              <button
                onClick={() => {
                  clearMediaSoupConnection(
                    socket,
                    session?.user.userId || "",
                    selectedConversation?.conversation.conversation_id || ""
                    // setMyStream
                  );
                  setCallEnded(true);
                }}
                className="bg-red-700 p-2 rounded-lg"
              >
                end
              </button>
            </div>
          </div>
        )}
        {incomingCall && (
          <div
            id="myStream"
            className="relative w-full bg-black border-red-300 border-solid border-2"
          >
            <video
              playsInline
              autoPlay
              className="w-full bg-blue-300 z-10"
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
          <div className="relative w-full flex gap-2">
            <div
              id="myStream"
              className={`absolute w-2/6 border-red-300 border-solid border-2`}
            >
              <video
                playsInline
                autoPlay
                className="w-full"
                id="myStreamVideoElement"
              ></video>
              {/*  myvideo display */}
            </div>
            <div
              id="remoteVideoDiv"
              className="w-full flexjustify-evenly border-red-800 border-solid border-2"
            ></div>
            <div className="absolute transform -translate-x-1/2 left-2/4 bottom-1/4">
              <button
                onClick={() => {
                  clearMediaSoupConnection(
                    socket,
                    session?.user.userId || "",
                    selectedConversation?.conversation.conversation_id || ""
                    // setMyStream
                  );
                  streamerMediaStreams?.forEach((stream) =>
                    stream.mediaStream
                      .getTracks()
                      .forEach((track) => track.stop())
                  );

                  setRemoteStreamTracks((prevTracks) => {
                    prevTracks?.forEach((remoteTrack) => {
                      remoteTrack.track.stop();
                    });
                    return null;
                  });
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
