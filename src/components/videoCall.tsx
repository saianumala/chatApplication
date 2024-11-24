import {
  callAcceptedAtom,
  incomingCallAtom,
  incomingCallMessageDataAtom,
  initiatedCallAtom,
  myStreamAtom,
  remoteMediaStreamsSelector,
  remoteTracksAtom,
  videoCallInitiatedAtom,
} from "@/recoil_store/src/atoms/atoms";
import { getMediaStream } from "@/utils/getMediaStream";
import { acceptIncomingCall } from "@/utils/mediaSoupConnection";
import { useWebSocketHandler } from "@/utils/webSocetConnection";
import { useSession } from "next-auth/react";
import { useEffect, useRef } from "react";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";

export default function VideoCall() {
  const [incomingCall, setIncomingCall] = useRecoilState(incomingCallAtom);
  const [callAccepted, setCallAccepted] = useRecoilState(callAcceptedAtom);
  const [videoCallInitiated, setVideoCallInitiated] = useRecoilState(
    videoCallInitiatedAtom
  );
  const streamerMediaStreams = useRecoilValue(remoteMediaStreamsSelector);
  const myStream = useRecoilValue(myStreamAtom);
  const remoteStreamTracks = useRecoilValue(remoteTracksAtom);
  const { data: session } = useSession();
  const socket = useWebSocketHandler();
  const incomingCallMessageData = useRecoilValue(incomingCallMessageDataAtom);
  useEffect(() => {
    const myStreamVideoElement = document.getElementById(
      "myStreamVideoElement"
    ) as HTMLVideoElement;
    if (myStreamVideoElement && myStreamVideoElement.srcObject === null) {
      getMediaStream("VIDEO").then((stream) => {
        myStreamVideoElement.srcObject = stream;
      });
    }
    if (remoteStreamTracks && remoteStreamTracks.length > 0) {
      if (videoCallInitiated) {
        setVideoCallInitiated(false);
        setCallAccepted(true);
      } else if (incomingCall) {
        setIncomingCall(false);
        setCallAccepted(true);
      } else if (callAccepted) {
        const myStreamVideoElement = document.getElementById(
          "myStreamVideoElement"
        ) as HTMLVideoElement;
        if (myStreamVideoElement && myStreamVideoElement.srcObject === null) {
          getMediaStream("VIDEO").then((stream) => {
            myStreamVideoElement.srcObject = stream;
          });
        }
        streamerMediaStreams?.map((remoteMediastream) => {
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
        });
      }
    }
  }, [remoteStreamTracks, videoCallInitiated, incomingCall, callAccepted]);

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
                // onClick={() =>
                //   // clear everything
                //   // setCallEnded()
                // }
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
                onClick={() => setVideoCallInitiated(false)}
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
              className="absolute w-2/6 border-red-300 border-solid border-2"
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
                onClick={() => setVideoCallInitiated(false)}
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
