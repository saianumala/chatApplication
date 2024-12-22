import {
  conversationAtom,
  displayCallLogsSelectedAtom,
  displayContactsSelectedAtom,
  displayConversationsSelectedAtom,
  messagesAtom,
  searchedContactsAtom,
  searchValueAtom,
} from "@/recoil_store/src/atoms/atoms";
import {
  closeConversation,
  handleChat,
  openConversation,
} from "@/utils/handlerFunctions";
import { useWebSocketHandler } from "@/utils/webSocetConnection";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import React, { MutableRefObject, useEffect } from "react";
import { useRecoilState, useSetRecoilState } from "recoil";

export default function SearchContacts({
  searchRef,
}: {
  searchRef: MutableRefObject<HTMLDialogElement | null>;
}) {
  const { data: session } = useSession();
  const socket = useWebSocketHandler();
  const router = useRouter();
  const setMessages = useSetRecoilState(messagesAtom);
  const [selectedConversation, setselectedConversation] =
    useRecoilState(conversationAtom);
  const setDisplayCallLogs = useSetRecoilState(displayCallLogsSelectedAtom);
  const setDisplayContacts = useSetRecoilState(displayContactsSelectedAtom);
  const setDisplayConversations = useSetRecoilState(
    displayConversationsSelectedAtom
  );

  const [searchedContacts, setSearchedContacts] =
    useRecoilState(searchedContactsAtom);
  const [searchValue, setSearchValue] = useRecoilState(searchValueAtom);

  useEffect(() => {
    fetch(`api/getSearchedUsers?searchValue=${searchValue}`)
      .then((data) => data.json())
      .then((data) => {
        console.log("searchedContact data: ", data);

        setSearchedContacts(data.data);
      });
  }, [searchValue]);

  async function checkConversation(friendNumber: string) {
    try {
      console.log("friendNumber", friendNumber);
      console.log("myNumber, ", session?.user.mobileNumber);
      const response = await fetch(
        `/api/conversation/check?myNumber=${session?.user.mobileNumber}&friendNumber=${friendNumber}`
      );
      const data = await response.json();
      console.log("check conversation data", data);
      if (response.ok) {
        console.log(data);
        return data;
      } else {
        console.error("error while checking conversation: ", data.error);
      }
    } catch (error: any) {
      console.error("Error while checking conversation:", error);
    }
  }
  async function conversationAndMessageSelection(conversation: any) {
    const newSelectedConversationData = await handleChat({
      chosenConversation: conversation.conversation,
      selectedConversationId: conversation.conversation_id || null,
      socket: socket,
      userId: session?.user.userId || "",
    });

    setselectedConversation({
      conversation: newSelectedConversationData.conversation,
    });
    setMessages(newSelectedConversationData.conversation.messages);
  }

  async function createConversation(friendNumber: string) {
    try {
      const response = await fetch("/api/conversation/create", {
        method: "POST",
        body: JSON.stringify({
          type: "NORMAL",
          myNumber: session?.user.mobileNumber,
          friendNumber: friendNumber,
        }),
        headers: {
          "content-type": "application/json",
        },
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message);
      } else {
        return data;
      }
    } catch (error: any) {
      console.error("Error creating conversation:", error);
      throw error;
    }
  }

  async function handleConversation({
    searchedContact,
  }: {
    searchedContact: {
      contactID: string;
      contactName: string;
      mobileNumber: string;
    };
  }) {
    let checkedData = await checkConversation(searchedContact.mobileNumber);
    console.log(
      "conversaton after check",
      checkedData.conversation.conversation_id
    );
    if (checkedData.message === "inviteFriend") {
      alert("invite your friend");
    } else if (checkedData.message === "conversationFound") {
      await conversationAndMessageSelection(checkedData);
    } else if (checkedData.message === "conversationNotFound") {
      const createConversationData = await createConversation(
        searchedContact.mobileNumber
      );
      await conversationAndMessageSelection(createConversationData);
    } else {
      console.log("error", checkedData.message);
    }
  }

  return (
    <div className="flex flex-col gap-1 w-3/4 p-2">
      <input
        className="outline-none p-2 w-full text-black rounded-md"
        type="search"
        placeholder="search contacts"
        onChange={(e) => setSearchValue(e.target.value)}
      />
      <div className="flex flex-col gap-1 bg-white rounded-md ">
        {searchedContacts?.map((searchedContact) => (
          <div
            key={searchedContact.contactID}
            className="flex p-1 justify-evenly items-center border-solid border-b-2 rounded-md border-black"
          >
            <button
              disabled={!searchedContact.hasAccount}
              className=" text-black w-full "
              key={searchedContact.contactID}
              onClick={() => {
                setDisplayCallLogs(false);
                setDisplayContacts(false);
                setDisplayConversations(true);
                handleConversation({ searchedContact });
                setSearchedContacts(null);
                searchRef.current?.close();
              }}
            >
              {searchedContact.contactName}
            </button>

            {!searchedContact.hasAccount && (
              <button className="bg-slate-400 hover:scale-105 transition-all active:bg-slate-500 p-1 rounded-md">
                invite
              </button>
            )}
          </div>
        ))}
      </div>
      <button
        className="w-full text-center underline"
        onClick={() => {
          console.log("search ref current", searchRef.current);
          setSearchedContacts(null);

          searchRef.current?.close();
        }}
      >
        close
      </button>
    </div>
  );
}
