import {
  contactsAtom,
  groupCreateParticipantsAtom,
} from "@/recoil_store/src/atoms/atoms";
import { useRecoilState, useRecoilValue } from "recoil";

export function GroupCreateContacts() {
  const contacts = useRecoilValue(contactsAtom);
  const [participants, setParticipants] = useRecoilState(
    groupCreateParticipantsAtom
  );
  return (
    <div className="w-full">
      <h1 className="bg-slate-700">contacts</h1>
      {contacts ? (
        <div className="w-full  overflow-y-auto">
          {contacts &&
            contacts.map((eachContact) => {
              const isAdded = participants
                ? !!participants[eachContact.mobileNumber]
                : false;
              if (eachContact.friendsUserAccount) {
                return (
                  <div
                    key={eachContact.contactId}
                    className="flex gap-2 border-slate-700 border-solid border-b-[1px]"
                  >
                    <h3 className="w-11/12">{eachContact.contactName}</h3>
                    {isAdded ? (
                      <button disabled={isAdded}>added</button>
                    ) : (
                      <button
                        onClick={() => {
                          setParticipants((prev) =>
                            prev
                              ? {
                                  ...prev,
                                  [eachContact.mobileNumber]: {
                                    participantNumber: eachContact.mobileNumber,
                                    contactName: eachContact.contactName,
                                    contactId: eachContact.contactId,
                                  },
                                }
                              : {
                                  [eachContact.mobileNumber]: {
                                    participantNumber: eachContact.mobileNumber,
                                    contactName: eachContact.contactName,
                                    contactId: eachContact.contactId,
                                  },
                                }
                          );
                        }}
                      >
                        add
                      </button>
                    )}
                  </div>
                );
              }
            })}
        </div>
      ) : (
        <h1>no contacts</h1>
      )}
    </div>
  );
}
