"use client";

import { useRecoilState, useSetRecoilState } from "recoil";
import {
  contactsAtom,
  showOptionsForIdAtom,
} from "@/recoil_store/src/atoms/atoms";
import { MutableRefObject, useEffect, useRef, useState } from "react";
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
  const updateRef = useRef<HTMLDialogElement>(null);
  const [contactToEdit, setContactToEdit] = useState<{
    contactId: string;
    savedById: string;
    mobileNumber: string;
    contactName: string;
  } | null>(null);
  const [showOptionsForId, setShowOptionsForId] =
    useRecoilState(showOptionsForIdAtom);
  console.log("contact to edit: ", contactToEdit);
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
    <div
      onClick={() => {
        selectedContact && setSelectedContact(null);
        showOptionsForId && setShowOptionsForId(null);
      }}
      className="flex flex-col w-full h-full "
    >
      {contactToEdit?.contactName}
      <dialog
        className="w-2/4 h-2/4 bg-slate-400 top-2/4 left-2/4 -translate-x-[50%] -translate-y-[50%]  p-2"
        ref={updateRef}
      >
        <form
          className="flex flex-col gap-3 justify-center items-center"
          id="updateForm"
          onSubmit={(e) => {
            e.preventDefault();
            const updateFormElement = document.getElementById(
              "updateForm"
            ) as HTMLFormElement;
            const formData = new FormData(updateFormElement);
            const name = formData.get("contactName");
            const mobileNumber = formData.get("mobileNumber");
            console.log("name: ", name);
            console.log("number: ", mobileNumber);
            setContactToEdit(null);
            updateRef.current?.close();
          }}
        >
          <input
            className="border-[1px] border-black border-solid bg-slate-200"
            name="contactName"
            type="text"
            defaultValue={contactToEdit?.contactName}
          />
          <input
            className="border-[1px] border-black border-solid bg-slate-200"
            name="mobileNumber"
            type="text"
            defaultValue={contactToEdit?.mobileNumber}
          />
          <div>
            <button
              className="bg-slate-700 p-2 rounded-md text-white active:scale-90"
              type="submit"
            >
              update
            </button>
            <button
              type="button"
              onClick={() => {
                setContactToEdit(null);
                updateRef.current?.close();
              }}
              className="bg-slate-700 p-2 rounded-md text-white active:scale-90"
            >
              cancel
            </button>
          </div>
        </form>
      </dialog>
      <div className="flex flex-col w-full h-full gap-2 overflow-y-auto">
        {contacts ? (
          contacts.map((contact) => (
            <div key={contact.contactId} className="w-full">
              {contact.mobileNumber !== session?.user.mobileNumber && (
                <div
                  key={contact.contactId}
                  className="flex gap-2 group rounded-md w-full bg-slate-400 p-2"
                >
                  <h1 className="w-[28px] bg-slate-700 rounded-full flex items-center justify-center">
                    {contact.contactName.charAt(0).toUpperCase()}
                  </h1>
                  <div
                    onClick={() =>
                      setSelectedContact((prevContact) => {
                        if (prevContact?.contactId === contact.contactId) {
                          return null;
                        }
                        return contact;
                      })
                    }
                    className="flex-1"
                  >
                    <button>{contact.contactName}</button>
                    {selectedContact?.contactId === contact.contactId && (
                      <h2>{contact.mobileNumber}</h2>
                    )}
                  </div>
                  {!contact.hasAccount && (
                    <div>
                      <button>invite</button>
                    </div>
                  )}
                  <div className="relative w-5">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      height="25px"
                      viewBox="0 -960 960 960"
                      width="25px"
                      className="hover:cursor-pointer"
                      onClick={() => {
                        setSelectedContact(null);
                        setShowOptionsForId((prevId) => {
                          if (prevId === contact.contactId) {
                            return null;
                          }
                          return contact.contactId;
                        });
                      }}
                    >
                      <path d="M480-160q-33 0-56.5-23.5T400-240q0-33 23.5-56.5T480-320q33 0 56.5 23.5T560-240q0 33-23.5 56.5T480-160Zm0-240q-33 0-56.5-23.5T400-480q0-33 23.5-56.5T480-560q33 0 56.5 23.5T560-480q0 33-23.5 56.5T480-400Zm0-240q-33 0-56.5-23.5T400-720q0-33 23.5-56.5T480-800q33 0 56.5 23.5T560-720q0 33-23.5 56.5T480-640Z" />
                    </svg>
                    {showOptionsForId === contact.contactId && (
                      <ul className="absolute top-4 right-3 bg-slate-700 p-2 rounded-md">
                        <li
                          className="hover:cursor-pointer bg-slate-400 p-1 rounded-md active:scale-95"
                          onClick={() => {
                            console.log(contact);

                            setContactToEdit(contact);
                            updateRef?.current?.showModal();
                            setShowOptionsForId(null);
                          }}
                        >
                          update
                        </li>
                        <li className="hover:pointer">delete</li>
                      </ul>
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
