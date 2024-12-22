import { groupCreateParticipantsAtom } from "@/recoil_store/src/atoms/atoms";
import { useSession } from "next-auth/react";
import React, { MutableRefObject, RefObject, useState } from "react";
import { useRecoilState } from "recoil";

function GroupCreateParticipants({
  groupCreateRef,
}: {
  groupCreateRef: RefObject<HTMLDialogElement> | null;
}) {
  const [participants, setParticipants] = useRecoilState(
    groupCreateParticipantsAtom
  );
  const [errorMessge, setErrorMessage] = useState<string | null>(null);
  const { data: session } = useSession();
  const [conversationName, setConversationName] = useState<string | null>(null);

  async function createGroup() {
    if (session && session.user.mobileNumber) {
      const conversationParticipants =
        participants &&
        Object.values(participants)?.map(
          (participant) => participant.participantNumber
        );
      conversationParticipants?.push(session?.user?.mobileNumber);
      const createResponse = await fetch("api/conversation/gcreate", {
        method: "POST",
        body: JSON.stringify({
          type: "GROUP",
          conversationName: conversationName,
          conversationParticipants: conversationParticipants,
        }),
        headers: {
          "content-type": "application/json",
        },
      });
      const createData = await createResponse.json();
      if (createResponse.ok) {
        setParticipants(null);
        groupCreateRef?.current?.close();
      } else {
        setErrorMessage(createData.message);
      }
    }
  }

  return (
    <div>
      <div className="p-2 flex gap-3">
        <label htmlFor="groupName">Group Name</label>
        <input
          onChange={(e) => setConversationName(e.target.value)}
          name="groupName"
          type="text"
          placeholder="name"
        />
      </div>
      <h1>{errorMessge}</h1>
      <h1 className="bg-slate-700 w-full">participants</h1>

      <div className="flex flex-col w-full overflow-y-auto">
        {participants &&
          Object.values(participants)?.map((participant) => (
            <div
              key={participant.contactId}
              className="flex justify-between border-slate-700 border-solid border-b-[1px]"
            >
              <h1>{participant.contactName}</h1>
              <button
                onClick={() => {
                  setParticipants((prevParticipants) => {
                    if (!prevParticipants) {
                      return null;
                    }
                    delete prevParticipants[participant.participantNumber];
                    return { ...prevParticipants };
                  });
                }}
              >
                {" "}
                remove
              </button>
            </div>
          ))}
      </div>

      <button
        // className={`${
        //   Object.keys(participants).length === 0 && "cursor-not-allowed "
        // }`}
        onClick={createGroup}
      >
        create
      </button>
    </div>
  );
}

export { GroupCreateParticipants };
