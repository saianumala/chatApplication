import { MutableRefObject, useEffect, useState } from "react";

export function GroupCreate({
  groupCreateRef,
  myNumber,
}: {
  groupCreateRef: MutableRefObject<HTMLDialogElement | null>;
  myNumber: string;
}) {
  const [participants, setParticipants] = useState<{
    [participantNumber: string]: {
      contactId: string;
      participantNumber: string;
      contactName: string;
    };
  } | null>(null);
  const [contacts, setContacts] = useState<
    | {
        contactId: string;
        savedById: string;
        mobileNumber: string;
        contactName: string;
      }[]
    | null
  >(null);
  const [conversationName, setConversationName] = useState<string | null>(null);
  const [errorMessge, setErrorMessage] = useState<string | null>(null);
  useEffect(() => {
    fetch("api/contact/getContacts")
      .then((contactsResponse) => contactsResponse.json())
      .then((contactsData) => setContacts(contactsData.contacts))
      .catch((error) => console.log(error));
  }, []);
  async function createGroup() {
    const conversationParticipants =
      participants &&
      Object.values(participants)?.map(
        (participant) => participant.participantNumber
      );
    conversationParticipants?.push(myNumber);
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
      groupCreateRef.current?.close();
    } else {
      setErrorMessage(createData.message);
    }
  }
  return (
    <div className="w-full h-full flex overflow-y-auto flex-col bg-slate-400 items-center justify-center">
      <div className="p-2 w-full h-full ">
        <div className="p-2 flex gap-3">
          <label htmlFor="groupName">Group Name</label>
          <input
            onChange={(e) => setConversationName(e.target.value)}
            name="groupName"
            type="text"
            placeholder="name"
          />
        </div>
        <div className="flex flex-col w-full max-h-[300px] p-1 gap-3">
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
          {participants && Object.keys(participants).length > 0 && (
            <button onClick={createGroup}>create</button>
          )}

          <h1 className="bg-slate-700">contacts</h1>
          <div className="w-full  overflow-y-auto">
            {contacts &&
              contacts.map((eachContact) => {
                const isAdded = participants
                  ? !!participants[eachContact.mobileNumber]
                  : false;
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
              })}
          </div>
        </div>
      </div>
      <button
        className="underline text-lg"
        onClick={() => {
          setParticipants(null);
          groupCreateRef.current?.close();
        }}
      >
        close
      </button>
    </div>
  );
}
