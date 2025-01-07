import {
  audioCallAtom,
  audioCallInitiatedAtom,
  callAcceptedAtom,
  conversationAtom,
  incomingCallAtom,
  incomingCallMessageDataAtom,
  remoteMediaStreamsSelector,
  remoteTracksAtom,
} from "@/recoil_store/src/atoms/atoms";
import { clearMediaStream } from "@/utils/getMediaStream";
import {
  acceptIncomingCall,
  clearMediaSoupConnection,
} from "@/utils/mediaSoupConnection";
import { useWebSocketHandler } from "@/utils/webSocetConnection";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";

export function AudioCall() {
  const [audioCallInitiated, setAudioCallInitiated] = useRecoilState(
    audioCallInitiatedAtom
  );
  const { data: session } = useSession();
  const selectedConversation = useRecoilValue(conversationAtom);
  const [callEnded, setCallEnded] = useState(false);
  const incomingCallMessageData = useRecoilValue(incomingCallMessageDataAtom);
  const audioCall = useRecoilValue(audioCallAtom);
  const [incomingCall, setIncomingCall] = useRecoilState(incomingCallAtom);
  const [callAccepted, setCallAccepted] = useRecoilState(callAcceptedAtom);
  const streamerMediaStreams = useRecoilValue(remoteMediaStreamsSelector);
  const [remoteStreamTracks, setRemoteStreamTracks] =
    useRecoilState(remoteTracksAtom);
  const setAudioCall = useSetRecoilState(audioCallAtom);
  const socket = useWebSocketHandler();

  useEffect(() => {
    console.log("streamertracks before the call started: ", remoteStreamTracks);
    console.log("reomote streams: ", streamerMediaStreams);

    if (remoteStreamTracks && remoteStreamTracks.length > 0) {
      if (audioCallInitiated) {
        setAudioCallInitiated(false);
        setCallAccepted(true);
      } else if (incomingCall) {
        setIncomingCall(false);
        setCallAccepted(true);
      } else if (callAccepted) {
        console.log("remotemediastreams: ", streamerMediaStreams);
        const remoteStreamElements =
          document.getElementById("remoteVideoDiv")?.childNodes;
        console.log("remoteStreamElements:", remoteStreamElements);
        const remoteAudioDiv = document.getElementById(
          "remoteAudioDiv"
        ) as HTMLDivElement;

        // streamerMediaStreams?.map((remoteMediastream) => {
        //   if (remoteMediastream) {
        //     const audioElement = document.getElementById(
        //       remoteMediastream.remoteStreamerId
        //     ) as HTMLAudioElement;
        //     if (!audioElement) {
        //       console.log("remoteMediastream ", streamerMediaStreams.length);
        //       const remoteAudioELement = document.createElement("audio");
        //       remoteAudioELement.autoplay = true;
        //       remoteAudioELement.id = remoteMediastream.remoteStreamerId;
        //       remoteAudioELement.style.width = "100px";
        //       remoteAudioELement.style.height = "100px";
        //       const remoteAudioDiv = document.getElementById(
        //         "remoteAudioDiv"
        //       ) as HTMLDivElement;
        //       remoteAudioDiv.style.border = "2px solid red";
        //       if (remoteAudioELement.srcObject === null) {
        //         remoteAudioELement.srcObject = remoteMediastream.mediaStream;
        //       }
        //       console.log("remoteMediaStream: ", remoteMediastream);
        //       console.log("remoteAudioELement", remoteAudioELement);
        //       // console.log("remoteVideoDiv", remoteVideoDiv);
        //       remoteAudioDiv.appendChild(remoteAudioELement);
        //     }
        //   } else {
        //     console.log("remote mediastream not found");
        //   }
        // });
      }
    }
  }, [streamerMediaStreams, audioCallInitiated, incomingCall, callAccepted]);
  useEffect(() => {
    if (callEnded) {
      setAudioCallInitiated(false);
      clearMediaStream();
      setIncomingCall(false);
      setCallAccepted(false);

      setAudioCall(false);
    }
  }, [callEnded]);
  return (
    <div className="w-full h-full group">
      {audioCall && audioCallInitiated && (
        // logic to handle outgoing call

        <div className="relative bg-slate-700 w-[350px] h-full">
          <div className="flex justify-center items-center w-full h-full">
            <div className="text-center w-[150px] rounded-full object-cover bg-black text-white h-[150px]">
              {selectedConversation?.conversation.conversationName || "DP"}
            </div>
          </div>
          <div
            onClick={() => {
              clearMediaSoupConnection(socket, session?.user.userId || "");
              setCallEnded(true);
            }}
            className="absolute rounded-full w-[35px] group-hover:opacity-100 transition-all bg-red-800 ease-in -translate-x-2/4 left-2/4 bottom-10"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="35px"
              viewBox="0 -960 960 960"
              width="35px"
              fill="#e8eaed"
              className="-full p-2 hover:cursor-pointer"
            >
              <path d="M796-120q-119 0-240-55.5T333-333Q231-435 175.5-556T120-796q0-18.86 12.57-31.43T164-840h147.33q14 0 24.34 9.83Q346-820.33 349.33-806l26.62 130.43q2.05 14.9-.62 26.24-2.66 11.33-10.82 19.48L265.67-530q24 41.67 52.5 78.5T381-381.33q35 35.66 73.67 65.5Q493.33-286 536-262.67l94.67-96.66q9.66-10.34 23.26-14.5 13.61-4.17 26.74-2.17L806-349.33q14.67 4 24.33 15.53Q840-322.27 840-308v144q0 18.86-12.57 31.43T796-120ZM233-592l76-76.67-21-104.66H187q3 41.66 13.67 86Q211.33-643 233-592Zm365.33 361.33q40.34 18.34 85.84 29.67 45.5 11.33 89.16 13.67V-288l-100-20.33-75 77.66ZM233-592Zm365.33 361.33Z" />
            </svg>
          </div>
        </div>
      )}

      {/* <div> */}
      {audioCall && incomingCall && (
        // logic to handle incoming audio call
        <div className="relative bg-slate-700 w-[] h-full">
          <div className="flex justify-center items-center w-full h-full">
            <div className="text-center w-[150px] rounded-full object-cover bg-black text-white h-[150px]">
              DP
            </div>
          </div>
          <div className="absolute rounded-full w-[35px] transition-all ease-in -translate-x-2/4 left-2/4 bottom-10">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="35px"
              viewBox="0 -960 960 960"
              width="35px"
              fill="#e8eaed"
              className="-full p-2 hover:cursor-pointer  bg-green-800"
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
            >
              <path d="M796-120q-119 0-240-55.5T333-333Q231-435 175.5-556T120-796q0-18.86 12.57-31.43T164-840h147.33q14 0 24.34 9.83Q346-820.33 349.33-806l26.62 130.43q2.05 14.9-.62 26.24-2.66 11.33-10.82 19.48L265.67-530q24 41.67 52.5 78.5T381-381.33q35 35.66 73.67 65.5Q493.33-286 536-262.67l94.67-96.66q9.66-10.34 23.26-14.5 13.61-4.17 26.74-2.17L806-349.33q14.67 4 24.33 15.53Q840-322.27 840-308v144q0 18.86-12.57 31.43T796-120ZM233-592l76-76.67-21-104.66H187q3 41.66 13.67 86Q211.33-643 233-592Zm365.33 361.33q40.34 18.34 85.84 29.67 45.5 11.33 89.16 13.67V-288l-100-20.33-75 77.66ZM233-592Zm365.33 361.33Z" />
            </svg>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="35px"
              viewBox="0 -960 960 960"
              width="35px"
              fill="#e8eaed"
              className="-full p-2 hover:cursor-pointer  bg-red-800"
              onClick={() => {
                setCallEnded(true);
              }}
            >
              <path d="M796-120q-119 0-240-55.5T333-333Q231-435 175.5-556T120-796q0-18.86 12.57-31.43T164-840h147.33q14 0 24.34 9.83Q346-820.33 349.33-806l26.62 130.43q2.05 14.9-.62 26.24-2.66 11.33-10.82 19.48L265.67-530q24 41.67 52.5 78.5T381-381.33q35 35.66 73.67 65.5Q493.33-286 536-262.67l94.67-96.66q9.66-10.34 23.26-14.5 13.61-4.17 26.74-2.17L806-349.33q14.67 4 24.33 15.53Q840-322.27 840-308v144q0 18.86-12.57 31.43T796-120ZM233-592l76-76.67-21-104.66H187q3 41.66 13.67 86Q211.33-643 233-592Zm365.33 361.33q40.34 18.34 85.84 29.67 45.5 11.33 89.16 13.67V-288l-100-20.33-75 77.66ZM233-592Zm365.33 361.33Z" />
            </svg>
          </div>
        </div>
      )}
      {/* </div> */}

      {audioCall && callAccepted && (
        // handle logic when call is accepted
        <div className="relative bg-slate-700 w-full h-full">
          <div className="flex justify-center items-center w-full h-full">
            <div className="text-center w-[150px] rounded-full object-cover  bg-black text-white h-[150px]">
              {selectedConversation?.conversation.conversationName || "DP"}
            </div>
          </div>
          {streamerMediaStreams?.map((streamerMediaStream) => (
            <div
              key={streamerMediaStream?.remoteStreamerId}
              id="remoteAudioDiv"
              className="flex flex-wrap justify-center items-center w-full h-full"
            >
              <audio
                autoPlay
                ref={(audio) => {
                  if (audio) {
                    audio.srcObject = streamerMediaStream?.mediaStream || null;
                  }
                }}
              ></audio>
            </div>
          ))}

          <div className="absolute rounded-full w-[35px]  transition-all bg-red-800 ease-in -translate-x-2/4 left-2/4 bottom-10">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="35px"
              viewBox="0 -960 960 960"
              width="35px"
              fill="#e8eaed"
              className="-full p-2 hover:cursor-pointer"
              onClick={() => {
                clearMediaSoupConnection(socket, session?.user.userId || "");
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
                      ) as HTMLAudioElement);

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
              }}
            >
              <path d="M796-120q-119 0-240-55.5T333-333Q231-435 175.5-556T120-796q0-18.86 12.57-31.43T164-840h147.33q14 0 24.34 9.83Q346-820.33 349.33-806l26.62 130.43q2.05 14.9-.62 26.24-2.66 11.33-10.82 19.48L265.67-530q24 41.67 52.5 78.5T381-381.33q35 35.66 73.67 65.5Q493.33-286 536-262.67l94.67-96.66q9.66-10.34 23.26-14.5 13.61-4.17 26.74-2.17L806-349.33q14.67 4 24.33 15.53Q840-322.27 840-308v144q0 18.86-12.57 31.43T796-120ZM233-592l76-76.67-21-104.66H187q3 41.66 13.67 86Q211.33-643 233-592Zm365.33 361.33q40.34 18.34 85.84 29.67 45.5 11.33 89.16 13.67V-288l-100-20.33-75 77.66ZM233-592Zm365.33 361.33Z" />
            </svg>
          </div>
        </div>
      )}
    </div>
  );
}
