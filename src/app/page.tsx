"use client";
import { useRouter } from "next/navigation";
import AllConversations from "@/components/allConversations";
import ChatRoom from "@/components/chatRoom";
import { useRecoilValue } from "recoil";
import { conversationAtom } from "@/recoil_store/src/atoms/atoms";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import CallProvider from "@/components/callProvider";

export default function Home() {
  const { data: session } = useSession();
  const selectedConversation = useRecoilValue(conversationAtom);

  const router = useRouter();
  console.error("home page rerendered");
  useEffect(() => {
    if (!session || !session.user.userId) {
      router.push("http://localhost:3000/user/signin");
    }
  }, [session]);
  return (
    <div className="h-screen w-screen">
      <div
        id="innerdiv"
        className="flex gap-1 items-start justify-center h-full bg-slate-200"
      >
        <div className="">
          <CallProvider />
        </div>
        <div className="w-3/12 p-2 h-full ">
          <div className="h-full w-full bg-slate-400">
            <AllConversations userID={session?.user.userId} />
          </div>
        </div>
        <div className="flex-1 p-2 h-full ">
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
