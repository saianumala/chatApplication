"use client";
import { useRouter } from "next/navigation";
import AllConversations from "@/components/allConversations";
import ChatRoom from "@/components/chatRoom";
import { useRecoilValue, useResetRecoilState, useSetRecoilState } from "recoil";
import {
  audioCallAtom,
  contactsAtom,
  conversationAtom,
  usersDetailsAtom,
  videoCallAtom,
} from "@/recoil_store/src/atoms/atoms";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import CallProvider from "@/components/callProvider";
import { getMediaStream } from "@/utils/getMediaStream";
import AudioDisplay from "@/components/audioDisplay";

export default function Home() {
  const { data: session } = useSession();
  const selectedConversation = useRecoilValue(conversationAtom);
  const videoCall = useRecoilValue(videoCallAtom);
  const audioCall = useRecoilValue(audioCallAtom);
  const router = useRouter();
  const setContacts = useSetRecoilState(contactsAtom);
  const setUsersDetails = useSetRecoilState(usersDetailsAtom);
  console.log("home page rerendered");
  useEffect(() => {
    console.log("inside use Effect");

    if (!session || !session.user.userId) {
      setUsersDetails(null);
      router.push("user/signin");
    } else if (session && session.user) {
      const userId = session.user.userId;
      const myMobileNumber = session.user.mobileNumber;
      setUsersDetails({
        userId: userId || null,
        myMobileNumber: myMobileNumber || null,
      });
      fetch("api/contact/getContacts").then(async (contactsJsonData) => {
        const parsedData = await contactsJsonData.json();
        // console.log("parsed Data", parsedData);
        setContacts(parsedData.contacts);
      });
    }
  }, []);

  return (
    <div className="relative h-screen w-screen">
      <div
        id="innerdiv"
        className="flex gap-1 items-start justify-center w-full h-full bg-slate-200"
      >
        <div className={`${videoCall || audioCall ? "block" : "hidden"}`}>
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
