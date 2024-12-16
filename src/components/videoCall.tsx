import {
  availableCamerasAtom,
  callAcceptedAtom,
  callDeclinedAtom,
  conversationAtom,
  incomingCallAtom,
  incomingCallMessageDataAtom,
  myStreamAtom,
  remoteMediaStreamsSelector,
  remoteTracksAtom,
  selectedCameraAtom,
  videoCallAtom,
  videoCallInitiatedAtom,
} from "@/recoil_store/src/atoms/atoms";
import { clearMediaStream, getMediaStream } from "@/utils/getMediaStream";
import { acceptIncomingCall } from "@/utils/mediaSoupConnection";
import { useWebSocketHandler } from "@/utils/webSocetConnection";
import { useSession } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import { clearMediaSoupConnection } from "@/utils/mediaSoupConnection";

export default function VideoCall() {
  const [incomingCall, setIncomingCall] = useRecoilState(incomingCallAtom);
  const [callAccepted, setCallAccepted] = useRecoilState(callAcceptedAtom);
  const [videoCallInitiated, setVideoCallInitiated] = useRecoilState(
    videoCallInitiatedAtom
  );
  const localVideoRef = useRef<HTMLDivElement | null>(null);

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
  const [localStreamPosition, setLocalStreamPosition] = useState({
    x: 10,
    y: 10,
  });
  const [availableCameras, setAvailableCameras] =
    useRecoilState(availableCamerasAtom);
  const [selectedCamera, setSelectedCamera] =
    useRecoilState(selectedCameraAtom);
  const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    const parent = e.currentTarget.parentElement;
    if (!parent) return;

    const parentRect = parent.getBoundingClientRect();
    const newX = e.clientX - parentRect.left - e.currentTarget.offsetWidth / 2;
    const newY = e.clientY - parentRect.top - e.currentTarget.offsetHeight / 2;

    setLocalStreamPosition({
      x: Math.max(
        0,
        Math.min(parentRect.width - e.currentTarget.offsetWidth, newX)
      ),
      y: Math.max(
        0,
        Math.min(parentRect.height - e.currentTarget.offsetHeight, newY)
      ),
    });
  };
  function handleCameraChange() {}
  useEffect(() => {
    async function getAvailableCameras() {
      const allConnectedDevices =
        await navigator.mediaDevices.enumerateDevices();
      const cameras = allConnectedDevices.filter(
        (device) => device.kind === "videoinput"
      );
      setAvailableCameras(cameras);
    }
    getAvailableCameras();
  }, []);

  useEffect(() => {
    console.log("video call: ", videoCall);
    console.log("streamertracks before the call started: ", remoteStreamTracks);
    console.log("reomote streams: ", streamerMediaStreams);
    if (videoCallInitiated || incomingCall || callAccepted) {
      if (!myStream) {
        console.log("creating my stream");

        getMediaStream("VIDEO")
          .then((stream) => {
            const videoTrack = stream.getVideoTracks()[0];
            myStream = new MediaStream([videoTrack]);
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
        // console.log("remotemediastreams: ", streamerMediaStreams);
        // const remoteStreamElements =
        //   document.getElementById("remoteVideoDiv")?.childNodes;
        // console.log("remoteStreamElements:", remoteStreamElements);
        // console.log("using stream:", myStream);
        // streamerMediaStreams?.map((remoteMediastream) => {
        //   if (remoteMediastream) {
        //     const videoElement = document.getElementById(
        //       remoteMediastream.remoteStreamerId
        //     ) as HTMLVideoElement;
        //     if (!videoElement) {
        //       console.log("remoteMediastream ", streamerMediaStreams.length);
        //       const remoteVideoElement = document.createElement("video");
        //       remoteVideoElement.autoplay = true;
        //       remoteVideoElement.id = remoteMediastream.remoteStreamerId;
        //       remoteVideoElement.style.width = "100%";
        //       // `${
        //       //   streamerMediaStreams.length === 1
        //       //     ? "100%"
        //       //     : streamerMediaStreams.length === 2
        //       //     ? "48%"
        //       //     : streamerMediaStreams.length === 3
        //       //     ? "33.33%"
        //       //     : "400px"
        //       // }`;
        //       remoteVideoElement.style.height = "100%";
        //       // `${
        //       //   streamerMediaStreams.length === 1
        //       //     ? "100%"
        //       //     : streamerMediaStreams.length === 2
        //       //     ? "100%"
        //       //     : streamerMediaStreams.length === 3
        //       //     ? "33.33%"
        //       //     : "400px"
        //       // }`;
        //       remoteVideoElement.style.objectFit = "cover";
        //       const remoteVideoDiv = document.getElementById(
        //         "remoteVideoDiv"
        //       ) as HTMLDivElement;
        //       if (remoteVideoElement.srcObject === null) {
        //         remoteVideoElement.srcObject = remoteMediastream.mediaStream;
        //       }
        //       console.log("remoteMediaStream: ", remoteMediastream);
        //       console.log("remoteVideoElement", remoteVideoElement);
        //       console.log("remoteVideoDiv", remoteVideoDiv);
        //       remoteVideoDiv.appendChild(remoteVideoElement);
        //     }
        //   } else {
        //     console.log("remote mediastream not found");
        //   }
        // });
      }
    }
  }, [streamerMediaStreams, videoCallInitiated, incomingCall, callAccepted]);
  useEffect(() => {
    if (callEnded) {
      console.log("clearing mystream tracks");
      myStream?.getTracks().forEach((track) => track.stop());
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
              ref={localVideoRef}
              draggable
              style={{
                left: `${localStreamPosition.x}px`,
                top: `${localStreamPosition.y}px`,
              }}
              onDragEnd={handleDragEnd}
              className={` ${
                streamerMediaStreams && streamerMediaStreams.length > 0
                  ? "absolute z-10 sm:w-2/6 w-2/4 bg-gray-900 p-4 rounded-lg overflow-hidden"
                  : "w-full h-full border-red-300 border-solid border-2"
              } `}
              // className="absolute w-32 h-32 z-10 bg-gray-900 p-4 rounded-lg overflow-hidden"
            >
              <video
                id="myStreamVideoElement"
                className="w-full h-full bg-gray-700 rounded-lg cursor-grab"
                muted
                autoPlay
              ></video>
              {/*  myvideo display */}
            </div>
            <div
              className={`${
                streamerMediaStreams?.length === 0
                  ? "hidden"
                  : "absolute w-full sm:w-full bg-gray-600 h-full"
              } `}
            >
              <div
                id="remoteVideoDiv"
                className={`w-full h-full gap-2 grid ${
                  streamerMediaStreams &&
                  (streamerMediaStreams.length === 1
                    ? "grid-cols-1"
                    : streamerMediaStreams?.length === 2
                    ? " sm:grid-cols-2 sm:grid-rows-1 grid-rows-2 grid-col-1"
                    : streamerMediaStreams.length >= 3 &&
                      streamerMediaStreams?.length <= 4
                    ? "grid-cols-2 grid-rows-1"
                    : streamerMediaStreams?.length >= 5 &&
                      streamerMediaStreams?.length <= 9
                    ? "grid-cols-3"
                    : "")
                }p-4`}
              >
                {streamerMediaStreams?.map((stream, index) => {
                  if (stream) {
                    return (
                      <video
                        key={stream?.remoteStreamerId}
                        className={`w-full h-full ${
                          streamerMediaStreams.length === 1
                            ? "absolute"
                            : "block"
                        } bg-gray-700 rounded-lg object-cover`}
                        autoPlay
                        playsInline
                        ref={(video) => {
                          if (video) {
                            video.srcObject = stream?.mediaStream;
                          }
                        }}
                      ></video>
                    );
                  }
                })}
              </div>
            </div>
            <div className="absolute transform -translate-x-1/2 left-2/4 bottom-1/4">
              {/* {availableCameras.length > 0 ? (
                availableCameras.length === 1 ? (
                  <svg
                    id=""
                    onClick={() => {
                      setSelectedCamera(availableCameras[0]);
                      handleCameraChange;
                    }}
                    xmlns="http://www.w3.org/2000/svg"
                    height="25px"
                    viewBox="0 -960 960 960"
                    width="25px"
                    className="hover:cursor-pointer hover:scale-105"
                  >
                    <path d="M320-280q-33 0-56.5-23.5T240-360v-240q0-33 23.5-56.5T320-680h40l40-40h160l40 40h40q33 0 56.5 23.5T720-600v240q0 33-23.5 56.5T640-280H320Zm0-80h320v-240H320v240Zm160-40q33 0 56.5-23.5T560-480q0-33-23.5-56.5T480-560q-33 0-56.5 23.5T400-480q0 33 23.5 56.5T480-400ZM342-940q34-11 68.5-15.5T480-960q94 0 177.5 33.5t148 93Q870-774 911-693.5T960-520h-80q-7-72-38-134.5t-79.5-110Q714-812 651-842t-135-36l62 62-56 56-180-180ZM618-20Q584-9 549.5-4.5T480 0q-94 0-177.5-33.5t-148-93Q90-186 49-266.5T0-440h80q8 72 38.5 134.5t79 110Q246-148 309-118t135 36l-62-62 56-56L618-20ZM480-480Z" />
                  </svg>
                ) : (
                  <select
                    onSelect={() => {
                      // setSelectedCamera()
                      handleCameraChange;
                    }}
                    name=""
                    id=""
                  >
                    <option value="">cameras</option>
                    {availableCameras.map((camera) => (
                      <option key={camera.deviceId} value="">
                        {camera.label}
                      </option>
                    ))}
                  </select>
                )
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  height="25px"
                  viewBox="0 -960 960 960"
                  width="25px"
                  className="hover:cursor-not-allowed"
                >
                  <path d="M320-280q-33 0-56.5-23.5T240-360v-240q0-33 23.5-56.5T320-680h40l40-40h160l40 40h40q33 0 56.5 23.5T720-600v240q0 33-23.5 56.5T640-280H320Zm0-80h320v-240H320v240Zm160-40q33 0 56.5-23.5T560-480q0-33-23.5-56.5T480-560q-33 0-56.5 23.5T400-480q0 33 23.5 56.5T480-400ZM342-940q34-11 68.5-15.5T480-960q94 0 177.5 33.5t148 93Q870-774 911-693.5T960-520h-80q-7-72-38-134.5t-79.5-110Q714-812 651-842t-135-36l62 62-56 56-180-180ZM618-20Q584-9 549.5-4.5T480 0q-94 0-177.5-33.5t-148-93Q90-186 49-266.5T0-440h80q8 72 38.5 134.5t79 110Q246-148 309-118t135 36l-62-62 56-56L618-20ZM480-480Z" />
                </svg>
              )} */}

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
