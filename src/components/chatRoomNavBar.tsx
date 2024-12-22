import {
  audioCallAtom,
  audioCallInitiatedAtom,
  callTypeAtom,
  conversationAtom,
  updatedSelectedConversationSelector,
  videoCallAtom,
  videoCallInitiatedAtom,
} from "@/recoil_store/src/atoms/atoms";
import { initiateCall } from "@/utils/mediaSoupConnection";
import { useWebSocketHandler } from "@/utils/webSocetConnection";
import { useSession } from "next-auth/react";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
export function ChatRoomNavBar() {
  const setVideoCallInitiated = useSetRecoilState(videoCallInitiatedAtom);
  const setAudioCallInitiated = useSetRecoilState(audioCallInitiatedAtom);
  const setVideoCall = useSetRecoilState(videoCallAtom);
  const setAudioCall = useSetRecoilState(audioCallAtom);
  const setCallType = useSetRecoilState(callTypeAtom);
  const socket = useWebSocketHandler();
  const { data: session } = useSession();
  const [selectedConversation, setSelectedConversation] =
    useRecoilState(conversationAtom);

  const updatedSelectedConversation = useRecoilValue(
    updatedSelectedConversationSelector
  );
  console.log(updatedSelectedConversation);
  return (
    <nav className="flex justify-between gap-2 items-center bg-slate-200 flex-none w-full h-12 p-2">
      <svg
        onClick={() => {
          setSelectedConversation(null);
        }}
        xmlns="http://www.w3.org/2000/svg"
        height="30px"
        viewBox="0 -960 960 960"
        width="30px"
        fill="#e8eaed"
        className="fill-slate-400 hover:scale-110"
      >
        <path d="m287-446.67 240 240L480-160 160-480l320-320 47 46.67-240 240h513v66.66H287Z" />
      </svg>
      <span className="rounded-full bg-slate-400 w-8 h-8 text-center">dp</span>
      <div className="flex-1">
        {updatedSelectedConversation?.conversationName
          ? updatedSelectedConversation.conversationName
          : updatedSelectedConversation?.participantNumber}
      </div>
      <div className="flex-none">
        <div className="flex gap-2">
          <div
            className="hover:scale-110 hover:cursor-pointer w-8 h-8"
            onClick={() => {
              setVideoCallInitiated(true);
              setVideoCall(true);
              setCallType("video");
              initiateCall(
                "video",
                socket,
                updatedSelectedConversation?.conversation_id || "",
                session?.user.mobileNumber || ""
              );
            }}
          >
            {" "}
            <svg
              className="fill-slate-400"
              xmlns="http://www.w3.org/2000/svg"
              height="30px"
              viewBox="0 -960 960 960"
              width="30px"
              fill="#e8eaed"
            >
              <path d="M368-320h66.67v-128h128v-66.67h-128v-128H368v128H240V-448h128v128ZM146.67-160q-27 0-46.84-19.83Q80-199.67 80-226.67v-506.66q0-27 19.83-46.84Q119.67-800 146.67-800h506.66q27 0 46.84 19.83Q720-760.33 720-733.33V-530l160-160v420L720-430v203.33q0 27-19.83 46.84Q680.33-160 653.33-160H146.67Zm0-66.67h506.66v-506.66H146.67v506.66Zm0 0v-506.66 506.66Z" />
            </svg>
          </div>
          <div
            className="w-8 h-8 hover:scale-110"
            onClick={() => {
              setAudioCallInitiated(true);
              setAudioCall(true);
              setCallType("audio");
              initiateCall(
                "audio",
                socket,
                updatedSelectedConversation?.conversation_id || "",
                session?.user.mobileNumber || ""
              );
            }}
          >
            {" "}
            <svg
              className="fill-slate-400"
              xmlns="http://www.w3.org/2000/svg"
              height="30px"
              viewBox="0 -960 960 960"
              width="30px"
              fill="#e8eaed"
            >
              <path d="M796-120q-119 0-240-55.5T333-333Q231-435 175.5-556T120-796q0-18.86 12.57-31.43T164-840h147.33q14 0 24.34 9.83Q346-820.33 349.33-806l26.62 130.43q2.05 14.9-.62 26.24-2.66 11.33-10.82 19.48L265.67-530q24 41.67 52.5 78.5T381-381.33q35 35.66 73.67 65.5Q493.33-286 536-262.67l94.67-96.66q9.66-10.34 23.26-14.5 13.61-4.17 26.74-2.17L806-349.33q14.67 4 24.33 15.53Q840-322.27 840-308v144q0 18.86-12.57 31.43T796-120ZM233-592l76-76.67-21-104.66H187q3 41.66 13.67 86Q211.33-643 233-592Zm365.33 361.33q40.34 18.34 85.84 29.67 45.5 11.33 89.16 13.67V-288l-100-20.33-75 77.66ZM233-592Zm365.33 361.33Z" />
            </svg>
          </div>
        </div>
      </div>
    </nav>
  );
}
