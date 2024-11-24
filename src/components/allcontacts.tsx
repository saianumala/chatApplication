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
      <div className="flex flex-col items-start">
        {contacts ? (
          contacts.map((contact) => (
            <div key={contact.contactId}>
              {contact.mobileNumber !== session?.user.mobileNumber && (
                <div
                  onClick={() => setSelectedContact(contact)}
                  key={contact.contactId}
                  className="bg-slate-300 flex gap-2 border-solid border-black border-2 rounded-md"
                >
                  <h3>{contact.contactName}</h3>
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
