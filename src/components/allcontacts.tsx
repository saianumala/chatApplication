"use client";

import { useRecoilState, useSetRecoilState } from "recoil";
import { contactsAtom } from "@/recoil_store/src/atoms/atoms";
import { MutableRefObject, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Button from "./button";

export function AllContacts({
  contactsRef,
}: {
  contactsRef?: MutableRefObject<HTMLDialogElement | null>;
}) {
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

  async function handleOnclick(contact: {
    contactId: string;
    savedById: string;
    mobileNumber: string;
    contactName: string;
  }) {
    console.log("contact: ", contact);
    // display contact details
  }

  return (
    <div className="flex flex-col items-center w-full h-full justify-center">
      <div className="flex flex-col items-center justify-center w-full gap-2">
        {contacts ? (
          contacts.map((contact) => (
            <div key={contact.contactId} className="w-2/4">
              {contact.mobileNumber !== session?.user.mobileNumber && (
                <div
                  onClick={() => setSelectedContact(contact)}
                  key={contact.contactId}
                  className="rounded-md w-full bg-slate-400"
                >
                  <button>{contact.contactName}</button>
                </div>
              )}
            </div>
          ))
        ) : (
          <p>No contacts</p>
        )}
      </div>
      <button
        className={`${contactsRef && "hidden"}`}
        onClick={() => contactsRef?.current?.close()}
      >
        close
      </button>
    </div>
  );
}
