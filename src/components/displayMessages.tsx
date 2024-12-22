import { messagesAtom } from "@/recoil_store/src/atoms/atoms";
import { useSession } from "next-auth/react";
import { useEffect, useRef } from "react";
import { useRecoilValue } from "recoil";

export function DisplayMessages() {
  const messages = useRecoilValue(messagesAtom);
  const { data: session } = useSession();
  console.log("messages", messages);

  const scrollRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (scrollRef.current) {
      //   scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);
  return (
    <div
      ref={scrollRef}
      className="flex-1 h-5/6 flex flex-col scroll overflow-y-auto"
    >
      {messages?.map((eachMessage) => {
        // console.log("message created at", eachMessage.mesageId);

        if (eachMessage?.messageSentBy === session?.user.userId) {
          // console.log(eachMessage.createdAt);
          return (
            <div
              key={eachMessage.message_id}
              className="w-full flex justify-end"
            >
              <h4 className="m-2 p-2 rounded-t-md rounded-l-md bg-slate-200">
                {eachMessage?.content}
              </h4>
              <span className="uppercase">{}</span>
            </div>
          );
        } else {
          return (
            <div
              key={eachMessage.message_id}
              className="w-full flex justify-start"
            >
              <h4 className="m-2 p-2  rounded-r-md rounded-t-md bg-slate-200">
                {eachMessage?.content}
              </h4>
              <span className="uppercase">{}</span>
            </div>
          );
        }
      })}
    </div>
  );
}
