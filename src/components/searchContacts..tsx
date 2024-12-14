import {
  conversationAtom,
  messagesAtom,
  searchedContactsAtom,
  searchValueAtom,
} from "@/recoil_store/src/atoms/atoms";
import { useSession } from "next-auth/react";
import React, { useEffect } from "react";
import { useRecoilState, useSetRecoilState } from "recoil";

export default function SearchContacts() {
  const setMessages = useSetRecoilState(messagesAtom);
  const [selectedConversation, setselectedConversation] =
    useRecoilState(conversationAtom);

  const [searchedContacts, setSearchedContacts] =
    useRecoilState(searchedContactsAtom);
  const [searchValue, setSearchValue] = useRecoilState(searchValueAtom);
  const session = useSession();

  useEffect(() => {
    fetch(`api/getSearchedUsers?searchValue=${searchValue}`)
      .then((data) => data.json())
      .then((data) => setSearchedContacts(data.data));
  }, [searchValue]);

  async function checkConversation(friendNumber: string) {
    try {
      console.log("friendNumber", friendNumber);
      console.log("myNumber, ", session?.data?.user.mobileNumber);
      const response = await fetch(
        `/api/conversation/check?myNumber=${session.data?.user.mobileNumber}&friendNumber=${friendNumber}`
      );
      const data = await response.json();
      console.log(data);
      if (response.ok) {
        console.log(data);
        return data;
      }
    } catch (error: any) {
      if (error.response && error.response.status === 404) {
        return null;
      }
      console.error("Error checking conversation:", error);
      throw error;
    }
  }
  function conversationAndMessageSelection(conversation: any) {
    console.log(
      "conversation inside conversatioAndMessageSelection",
      conversation
    );
    if (conversation && conversation.conversation.messages) {
      console.log("conversation messages", conversation.conversation.messages);
      setselectedConversation(conversation);
      setMessages(conversation.conversation.messages);
    } else {
      setselectedConversation(conversation);

      setMessages([]);
    }
  }
  async function createConversation(friendNumber: string) {
    try {
      const response = await fetch("/api/conversation/create", {
        method: "POST",
        body: JSON.stringify({
          type: "NORMAL",
          myNumber: session.data?.user.mobileNumber,
          friendNumber: friendNumber,
        }),
        headers: {
          "content-type": "application/json",
        },
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error();
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
    let conversation = await checkConversation(searchedContact.mobileNumber);
    console.log("conversaton after check", conversation);
    if (!conversation) {
      const createConversationData = await createConversation(
        searchedContact.mobileNumber
      );
      conversationAndMessageSelection(createConversationData);
    } else {
      console.log("Conversation found:", conversation);
      conversationAndMessageSelection(conversation);
    }
  }

  return (
    <div className="relative w-full">
      <input
        className="outline-none w-full rounded-md"
        type="search"
        placeholder="search contacts"
        onChange={(e) => setSearchValue(e.target.value)}
      />
      <div>
        {searchedContacts?.map((searchedContact) => (
          <div
            className="absolute bg-white text-black w-full"
            key={searchedContact.contactID}
            onClick={() => handleConversation({ searchedContact })}
          >
            {searchedContact.contactName}
          </div>
        ))}
      </div>
      {/* <button onClick={() => searchRef.current?.close()}>close</button> */}
    </div>
  );
}
