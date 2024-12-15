"use client";

import { useRouter } from "next/navigation";
import { useRecoilState, useSetRecoilState } from "recoil";
import {
  conversationAtom,
  conversationsAtom,
  displayCallLogsSelectedAtom,
  displayContactsSelectedAtom,
  displayConversationsSelectedAtom,
  messagesAtom,
} from "@/recoil_store/src/atoms/atoms";
import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";

import { AddContact } from "./newContact";
import { AllContacts } from "./allcontacts";
import SearchContacts from "./searchContacts.";
import { GroupCreate } from "./groupCreate";

import { DisplayConversations } from "./displayConversations";
import { CallLogs } from "./callLogs";
import { DialogBox } from "./dialogBox";

// todo - notifications
// todo - add otp based login along with password
// todo - make routes protected
// todo - add a mini sidebar or a three dot icon for settings and other functionalities
// todo - add redis pubsub and horizontally scale the website

export default function AllConversations() {
  const { data: session } = useSession();
  const router = useRouter();
  const [displayCallLogs, setDisplayCallLogs] = useRecoilState(
    displayCallLogsSelectedAtom
  );
  const [displayContacts, setDisplayContacts] = useRecoilState(
    displayContactsSelectedAtom
  );
  const [displayConversations, setDisplayConversations] = useRecoilState(
    displayConversationsSelectedAtom
  );
  const [conversations, setConversations] = useRecoilState(conversationsAtom);
  const addContactRef = useRef<HTMLDialogElement | null>(null);
  const searchRef = useRef<HTMLDialogElement | null>(null);
  const groupCreateRef = useRef<HTMLDialogElement | null>(null);

  const [loading, setLoading] = useState(true);
  console.log("new conversations", conversations);

  // if (loading) {
  //   return (
  //     <>
  //       <h1>loading conversations</h1>
  //     </>
  //   );
  // } else {
  return (
    <div className="w-full h-full p-2">
      <DialogBox dialogRef={addContactRef}>
        <div className="flex justify-center w-full h-full">
          <AddContact addContactRef={addContactRef} />
        </div>
      </DialogBox>

      <DialogBox dialogRef={groupCreateRef}>
        <div className="flex justify-center w-full h-full">
          <GroupCreate
            myNumber={session?.user?.mobileNumber!}
            groupCreateRef={groupCreateRef}
          />
        </div>
      </DialogBox>
      <DialogBox dialogRef={searchRef}>
        <div className="flex justify-center w-full h-full">
          <SearchContacts searchRef={searchRef} />
        </div>
      </DialogBox>

      <div className="flex w-full flex-col h-full items-start">
        <div className="flex w-full flex-row h-full items-start">
          <div className="justify-start bg-slate-700 items-center overflow-hidden h-full w-1/6 flex flex-col gap-3 p-2 rounded-sm">
            <div className="flex-1 h-full overflow-hidden w-full content-center flex flex-col gap-4 items-center bg-slate-700">
              {/* search users */}
              <button
                onClick={() => searchRef.current?.showModal()}
                className="outline-none active:bg-slate-200"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  height="25px"
                  viewBox="0 -960 960 960"
                  width="25px"
                >
                  <path d="M784-120 532-372q-30 24-69 38t-83 14q-109 0-184.5-75.5T120-580q0-109 75.5-184.5T380-840q109 0 184.5 75.5T640-580q0 44-14 83t-38 69l252 252-56 56ZM380-400q75 0 127.5-52.5T560-580q0-75-52.5-127.5T380-760q-75 0-127.5 52.5T200-580q0 75 52.5 127.5T380-400Z" />
                </svg>
              </button>
              {/* all conversations or continue chatting */}
              <button
                className={` outline-none`}
                onClick={() => {
                  setDisplayCallLogs(false);
                  setDisplayContacts(false);
                  setDisplayConversations(true);
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  height="25px"
                  viewBox="0 -960 960 960"
                  width="25px"
                  className={`${displayConversations && "fill-slate-400"} `}
                >
                  <path d="M240-400h320v-80H240v80Zm0-120h480v-80H240v80Zm0-120h480v-80H240v80ZM80-80v-720q0-33 23.5-56.5T160-880h640q33 0 56.5 23.5T880-800v480q0 33-23.5 56.5T800-240H240L80-80Zm126-240h594v-480H160v525l46-45Zm-46 0v-480 480Z" />
                </svg>
              </button>
              {/* call logs */}
              <button
                onClick={() => {
                  setDisplayCallLogs(true);
                  setDisplayContacts(false);
                  setDisplayConversations(false);
                }}
                className={` outline-none`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  height="25px"
                  viewBox="0 -960 960 960"
                  width="25px"
                  className={`${displayCallLogs && "fill-slate-400"} `}
                >
                  <path d="M493.33-813.33V-880H880v66.67H493.33Zm0 146.66v-66.66H880v66.66H493.33Zm0 146.67v-66.67H880V-520H493.33ZM756-80q-119 0-240-55.5T293-293Q191-395 135.5-516T80-756q0-18.86 12.57-31.43T124-800h147.33q14 0 24.34 9.83Q306-780.33 309.33-766l26.62 130.43q2.05 14.9-.62 26.24-2.66 11.33-10.82 19.48L225.67-490q24 41.67 52.5 78.5T341-341.33q35 35.66 73.67 65.5Q453.33-246 496-222.67l94.67-96.66q9.66-10.34 23.26-14.5 13.61-4.17 26.74-2.17L766-309.33q14.67 4 24.33 15.53Q800-282.27 800-268v144q0 18.86-12.57 31.43T756-80ZM193-552l76-76.67-21-104.66H147q3 41.66 13.67 86Q171.33-603 193-552Zm365.33 361.33q40.34 18.34 85.84 29.67 45.5 11.33 89.16 13.67V-248l-100-20.33-75 77.66ZM193-552Zm365.33 361.33Z" />
                </svg>
              </button>
              {/* all contacts */}
              <button
                className={`outline-none `}
                onClick={() => {
                  setDisplayCallLogs(false);
                  setDisplayContacts(true);
                  setDisplayConversations(false);
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  height="25px"
                  viewBox="0 -960 960 960"
                  width="25px"
                  className={`${displayContacts && "fill-slate-400"} `}
                >
                  <path d="M149.33-40v-66.67h661.34V-40H149.33Zm0-813.33V-920h661.34v66.67H149.33ZM480-442.67q50 0 84.33-34.33 34.34-34.33 34.34-84.33t-34.34-84.34Q530-680 480-680t-84.33 34.33q-34.34 34.34-34.34 84.34T395.67-477Q430-442.67 480-442.67ZM141.33-160q-27 0-46.83-19.83-19.83-19.84-19.83-46.84v-506.66q0-28.34 19.83-47.5Q114.33-800 141.33-800h677.34q27 0 46.83 19.83 19.83 19.84 19.83 46.84v506.66q0 27-19.83 46.84Q845.67-160 818.67-160H141.33Zm82-66.67q49-60.66 117-92.33t139.34-31.67Q551-350.67 620-319q69 31.67 116.67 92.33h82v-506.66H141.33v506.66h82Zm102 0H636q-30.33-26.66-69.17-42Q528-284 480-284t-86.17 15.33q-38.16 15.34-68.5 42Zm154.78-282.66q-21.78 0-36.61-15.17-14.83-15.17-14.83-36.83 0-21.67 14.72-36.84 14.73-15.16 36.5-15.16 21.78 0 36.61 15.16 14.83 15.17 14.83 36.84 0 21.66-14.72 36.83-14.73 15.17-36.5 15.17ZM480-480Z" />
                </svg>{" "}
              </button>
              {/* add new contacts */}
              <button
                title="add Contact"
                onClick={() => addContactRef.current?.showModal()}
                className="outline-none"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  height="25px"
                  viewBox="0 -960 960 960"
                  width="25px"
                >
                  <path d="M726.67-400v-126.67H600v-66.66h126.67V-720h66.66v126.67H920v66.66H793.33V-400h-66.66ZM360-480.67q-66 0-109.67-43.66Q206.67-568 206.67-634t43.66-109.67Q294-787.33 360-787.33t109.67 43.66Q513.33-700 513.33-634t-43.66 109.67Q426-480.67 360-480.67ZM40-160v-100q0-34.67 17.5-63.17T106.67-366q70.66-32.33 130.89-46.5 60.22-14.17 122.33-14.17T482-412.5q60 14.17 130.67 46.5 31.66 15 49.5 43.17Q680-294.67 680-260v100H40Zm66.67-66.67h506.66V-260q0-14.33-7.83-27t-20.83-19q-65.34-31-116.34-42.5T360-360q-57.33 0-108.67 11.5Q200-337 134.67-306q-13 6.33-20.5 19t-7.5 27v33.33ZM360-547.33q37 0 61.83-24.84Q446.67-597 446.67-634t-24.84-61.83Q397-720.67 360-720.67t-61.83 24.84Q273.33-671 273.33-634t24.84 61.83Q323-547.33 360-547.33Zm0-86.67Zm0 407.33Z" />
                </svg>
              </button>
              {/* crreate group */}
              <button
                className="outline-none"
                title="create group"
                onClick={() => groupCreateRef.current?.showModal()}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  height="25px"
                  viewBox="0 -960 960 960"
                  width="25px"
                >
                  <path d="M482.67-484.67q27-32 40.5-68.33t13.5-81q0-44.67-13.5-81t-40.5-68.33q70.66-8.67 122.33 33 51.67 41.66 51.67 116.33T605-517.67q-51.67 41.67-122.33 33ZM700-160v-102.67q0-46-22.67-86.16-22.66-40.17-74-68.5 132.34 20.66 189.17 58.16 56.83 37.5 56.83 96.5V-160H700Zm100-286v-93.33h-93.33V-606H800v-93.33h66.67V-606H960v66.67h-93.33V-446H800Zm-483.33-34.67q-66 0-109.67-43.66Q163.33-568 163.33-634T207-743.67q43.67-43.66 109.67-43.66t109.66 43.66Q470-700 470-634t-43.67 109.67q-43.66 43.66-109.66 43.66ZM0-160v-100q0-34.67 18.17-63.17 18.16-28.5 48.5-42.83 68.66-31.67 127.66-46.17t122.34-14.5q63.33 0 122 14.5Q497.33-397.67 566-366q30.33 14.33 48.83 42.83t18.5 63.17v100H0Zm316.67-387.33q37 0 61.83-24.84Q403.33-597 403.33-634t-24.83-61.83q-24.83-24.84-61.83-24.84t-61.84 24.84Q230-671 230-634t24.83 61.83q24.84 24.84 61.84 24.84Zm-250 320.66h500V-260q0-14.33-7.17-26.67Q552.33-299 538-306q-64-30.33-114.33-42.17-50.34-11.83-107-11.83Q260-360 210-348.17 160-336.33 94.67-306q-13 6.33-20.5 19t-7.5 27v33.33Zm250-407.33Zm0 407.33Z" />
                </svg>
              </button>
            </div>

            <div className="flex-none w-full">
              <div className="flex items-center justify-center flex-col gap-4 overflow-hidden">
                {/* logout */}
                <button
                  className="w-full p-1 outline-none"
                  onClick={() => {
                    router.push("user/signout");
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    height="25px"
                    viewBox="0 -960 960 960"
                    width="25px"
                  >
                    <path d="M186.67-120q-27 0-46.84-19.83Q120-159.67 120-186.67v-586.66q0-27 19.83-46.84Q159.67-840 186.67-840h292.66v66.67H186.67v586.66h292.66V-120H186.67Zm470.66-176.67-47-48 102-102H360v-66.66h351l-102-102 47-48 184 184-182.67 182.66Z" />
                  </svg>
                </button>
                {/* settings */}
                <button className="flex outline-none items-center justify-center hover:scale-110 gap-2 w-full">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    height="25px"
                    viewBox="0 -960 960 960"
                    width="25px"
                  >
                    <path d="m382-80-18.67-126.67q-17-6.33-34.83-16.66-17.83-10.34-32.17-21.67L178-192.33 79.33-365l106.34-78.67q-1.67-8.33-2-18.16-.34-9.84-.34-18.17 0-8.33.34-18.17.33-9.83 2-18.16L79.33-595 178-767.67 296.33-715q14.34-11.33 32.34-21.67 18-10.33 34.66-16L382-880h196l18.67 126.67q17 6.33 35.16 16.33 18.17 10 31.84 22L782-767.67 880.67-595l-106.34 77.33q1.67 9 2 18.84.34 9.83.34 18.83 0 9-.34 18.5Q776-452 774-443l106.33 78-98.66 172.67-118-52.67q-14.34 11.33-32 22-17.67 10.67-35 16.33L578-80H382Zm55.33-66.67h85l14-110q32.34-8 60.84-24.5T649-321l103.67 44.33 39.66-70.66L701-415q4.33-16 6.67-32.17Q710-463.33 710-480q0-16.67-2-32.83-2-16.17-7-32.17l91.33-67.67-39.66-70.66L649-638.67q-22.67-25-50.83-41.83-28.17-16.83-61.84-22.83l-13.66-110h-85l-14 110q-33 7.33-61.5 23.83T311-639l-103.67-44.33-39.66 70.66L259-545.33Q254.67-529 252.33-513 250-497 250-480q0 16.67 2.33 32.67 2.34 16 6.67 32.33l-91.33 67.67 39.66 70.66L311-321.33q23.33 23.66 51.83 40.16 28.5 16.5 60.84 24.5l13.66 110Zm43.34-200q55.33 0 94.33-39T614-480q0-55.33-39-94.33t-94.33-39q-55.67 0-94.5 39-38.84 39-38.84 94.33t38.84 94.33q38.83 39 94.5 39ZM480-480Z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
          <div className="w-full h-full p-2">
            {displayCallLogs && (
              <div className={`w-full h-full`}>
                <CallLogs />
              </div>
            )}
            {displayConversations && (
              <div className="w-full h-full">
                <DisplayConversations />
              </div>
            )}
            {displayContacts && (
              <div className="w-full h-full">
                <AllContacts />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
// }
