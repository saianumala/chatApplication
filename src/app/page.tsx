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
import { useEffect } from "react";
import CallProvider from "@/components/callProvider";

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
    </div>
  );
}
