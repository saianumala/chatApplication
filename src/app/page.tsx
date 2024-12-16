"use client";
import { useRouter } from "next/navigation";
import AllConversations from "@/components/allConversations";
import ChatRoom from "@/components/chatRoom";
import { useRecoilValue } from "recoil";
import {
  audioCallAtom,
  conversationAtom,
  videoCallAtom,
} from "@/recoil_store/src/atoms/atoms";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import CallProvider from "@/components/callProvider";
import { getMediaStream } from "@/utils/getMediaStream";

export default function Home() {
  const { data: session } = useSession();
  const selectedConversation = useRecoilValue(conversationAtom);
  const videoCall = useRecoilValue(videoCallAtom);
  const audioCall = useRecoilValue(audioCallAtom);
  const router = useRouter();
  console.error("home page rerendered");
  useEffect(() => {
    if (!session || !session.user.userId) {
      router.push("user/signin");
    }
  }, []);

  const a = [1, 2, 3, 4, 5, 6, 7, 8];
  const [stream, setStream] = useState<MediaStream | null>(null);
  return (
    <div className="relative h-screen w-screen">
      <div
        id="innerdiv"
        className="flex gap-1 items-start justify-center w-full h-full bg-slate-200"
      >
        <div
          className={`${
            videoCall || audioCall
              ? "max-w-[350px] max-h-[95%] sm:max-w-full sm:max-h-full absolute  top-2/4 left-2/4 bg-black z-10 sm:w-3/4 sm:h-3/4 w-full h-full object-cover -translate-y-2/4 -translate-x-2/4"
              : "hidden"
          }`}
        >
          <CallProvider />
        </div>
        <div
          className={`max-w-[400px] sm:w-[400px] p-2 h-full ${
            selectedConversation ? "hidden sm:block " : "w-full"
          }  `}
        >
          <div className="h-full w-full bg-slate-400">
            <AllConversations />
          </div>
        </div>
        <div
          className={` sm:flex-1 ${
            selectedConversation ? "w-[400px] sm:flex-1" : "hidden sm:block"
          }  p-2 h-full `}
        >
          {selectedConversation && (
            <div className="w-full h-full">
              <ChatRoom userId={session?.user.userId || ""} />
            </div>
          )}
        </div>
      </div>{" "}
      {/* <div
        className={`${
          a.length === 0
            ? "hidden"
            : "absolute  -translate-x-[50%] -translate-y-[50%] top-2/4 left-2/4 w-3/5 sm:w-3/4 bg-gray-600 h-3/4"
        } `}
      >
        <div
          className={`w-full h-full gap-2 grid ${
            a.length === 2
              ? " grid-rows-2 sm:grid-cols-2"
              : a.length >= 3 && a.length <= 4
              ? "grid-cols-2"
              : a.length >= 5 && a.length <= 9
              ? "grid-cols-3"
              : ""
          }`}
        >
          {a.map(() => {
            return (
              <div
                className={`
                
                 bg-gray-950`}
              >
              
                {getMediaStream("VIDEO").then((mystream) => {
                  if (!stream) {
                    setStream(mystream);
                  }
                  return (
                    <video
                      ref={(video) => {
                        if (video) {
                          video.srcObject = mystream;
                        }
                      }}
                    ></video>
                  );
                })}
               
              </div>
            );
          })}
        </div>
      </div> */}
    </div>
  );
}
