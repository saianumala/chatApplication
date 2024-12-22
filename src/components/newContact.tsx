import {
  contactNameAtom,
  contactsAtom,
  newContactmobileNumberAtom,
} from "@/recoil_store/src/atoms/atoms";
import { FormEvent, MutableRefObject } from "react";
import { useRecoilState, useSetRecoilState } from "recoil";

export function AddContact({
  addContactRef,
}: {
  addContactRef: MutableRefObject<HTMLDialogElement | null>;
}) {
  const setContacts = useSetRecoilState(contactsAtom);
  const setContactName = useSetRecoilState(contactNameAtom);
  const [newContactMobileNumber, setNewContactMobileNumber] = useRecoilState(
    newContactmobileNumberAtom
  );
  async function handleAddContact(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formdata = new FormData(e.target as HTMLFormElement);
    const res = await fetch("/api/contact/createContact", {
      method: "post",
      body: JSON.stringify({
        mobileNumber: formdata.get("mobileNumber"),
        contactName: formdata.get("contactName"),
      }),
      headers: {
        "content-type": "application/json",
      },
    });
    const resData = await res.json();
    if (res.ok) {
      console.log("contact saved");
      console.log(resData.newContact);
      setContacts((prevContacts) => {
        const updatedContacts = prevContacts
          ? [...prevContacts, resData.newContact]
          : [resData.newContact];

        return updatedContacts;
      });
      setContactName(null);
      setNewContactMobileNumber(null);
      addContactRef?.current?.close();
    } else {
      console.error(res);
    }
  }
  return (
    <>
      <form
        onSubmit={handleAddContact}
        className="flex w-3/5  h-full flex-col gap-2 p-2 justify-center items-center"
      >
        <div className="flex flex-col w-full gap-2">
          <div>
            <label htmlFor="contactName">Name</label>
            <input
              required={true}
              onChange={(e) => setContactName(e.target.value)}
              className="text-black p-2 w-full rounded-md"
              name="contactName"
              id="contactName"
              type="text"
              placeholder="Contact Name"
            />
          </div>
          <div>
            <label htmlFor="mobileNumber">number</label>
            <input
              minLength={10}
              required={true}
              onChange={(e) => setNewContactMobileNumber(e.target.value)}
              id="newContactmobileNumber"
              className="text-black p-2 w-full rounded-md"
              type="text"
              placeholder="Phone Number"
              name="mobileNumber"
              value={newContactMobileNumber || ""}
            />
          </div>
        </div>
        <div className="flex flex-col justify-center gap-2 rounded-md p-2 bg-slate-700 w-full">
          <button type="submit" className="w-full p-2 bg-slate-500">
            Add Contact
          </button>
        </div>
        <button
          className="underline hover:scale-110 transition-all"
          onClick={(e) => {
            e.preventDefault();
            setContactName(null);
            setNewContactMobileNumber(null);
            addContactRef.current?.close();
          }}
        >
          close
        </button>
      </form>
    </>
  );
}
