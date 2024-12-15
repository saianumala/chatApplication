"use client";

import { useRecoilState, useSetRecoilState } from "recoil";
import { contactsAtom } from "@/recoil_store/src/atoms/atoms";
import { MutableRefObject, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Button from "./button";

export function AllContacts() {
  const { data: session } = useSession();
  const [contacts, setContacts] = useRecoilState(contactsAtom);
  const [selectedContact, setSelectedContact] = useState<{
    contactId: string;
    savedById: string;
    mobileNumber: string;
    contactName: string;
  } | null>(null);

  useEffect(() => {
    async function getContacts() {
      const contactsResponse = await fetch("api/contact/getContacts");

      const parsedData = await contactsResponse.json();
      console.log("parsed Data", parsedData);
      setContacts(parsedData?.contacts);
    }
    getContacts();
  }, []);

  return (
    <div className="flex flex-col w-full h-full ">
      <div className="flex flex-col w-full h-full gap-2 overflow-y-auto">
        {contacts ? (
          contacts.map((contact) => (
            <div key={contact.contactId} className="w-full">
              {contact.mobileNumber !== session?.user.mobileNumber && (
                <div
                  onClick={() => setSelectedContact(contact)}
                  key={contact.contactId}
                  className="flex gap-2 group rounded-md w-full bg-slate-400 p-2"
                >
                  <h1 className="w-[28px] bg-slate-700 rounded-full flex items-center justify-center">
                    {contact.contactName.charAt(0).toUpperCase()}
                  </h1>
                  <div>
                    <button>{contact.contactName}</button>
                    {selectedContact?.contactId === contact.contactId && (
                      <h2>{contact.mobileNumber}</h2>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))
        ) : (
          <p>No contacts</p>
        )}
      </div>
    </div>
  );
}
