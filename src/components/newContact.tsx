import { FormEvent, MutableRefObject } from "react";

export function AddContact({
  addContactRef,
}: {
  addContactRef: MutableRefObject<HTMLDialogElement | null>;
}) {
  async function handleAddContact(e: FormEvent<HTMLFormElement>) {
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
    if (res.ok) {
      console.log("contact saved");
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
              id="mobileNumber"
              className="text-black p-2 w-full rounded-md"
              type="search"
              placeholder="Phone Number"
              name="mobileNumber"
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
            addContactRef.current?.close();
          }}
        >
          close
        </button>
      </form>
    </>
  );
}
