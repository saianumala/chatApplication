import {
  contactsAtom,
  groupCreateParticipantsAtom,
} from "@/recoil_store/src/atoms/atoms";
import { MutableRefObject, RefObject, useEffect, useState } from "react";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import { GroupCreateParticipants } from "./groupCreateParticipants";
import { GroupCreateContacts } from "./groupCreateContacts";

export function GroupCreate({
  groupCreateRef,
  myNumber,
}: {
  groupCreateRef: RefObject<HTMLDialogElement>;
  myNumber: string;
}) {
  const [participants, setParticipants] = useRecoilState(
    groupCreateParticipantsAtom
  );
  const contacts = useRecoilValue(contactsAtom);

  return (
    <div className="w-full h-full flex overflow-y-auto flex-col bg-slate-400 items-center justify-center">
      <div className="p-2 w-full h-full ">
        <GroupCreateParticipants groupCreateRef={groupCreateRef} />

        <GroupCreateContacts />
      </div>
      <button
        className="underline text-lg"
        onClick={() => {
          setParticipants(null);
          groupCreateRef?.current?.close();
        }}
      >
        close
      </button>
    </div>
  );
}
