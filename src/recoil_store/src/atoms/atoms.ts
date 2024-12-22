import { atom, selector } from "recoil";
export const messagesAtom = atom<
  | {
      message_id: string;
      conversationId: string;
      content: string;
      createdAt: Date;
      messageSentBy: string;
      ReadStatus: {
        id: string;
        conversationId: string;
        isRead: boolean;
        readAt: Date;
      }[];
    }[]
  | null
>({
  key: "messagesAtom",
  default: null,
});
export const usersDetailsAtom = atom<{
  userId: string | null;
  myMobileNumber: string | null;
} | null>({
  key: "usersDetailsAtom",
});
export const searchValueAtom = atom<string | null>({
  key: "searchValueAtom",
  default: null,
});
export const socketAtom = atom<WebSocket | null>({
  key: "socketAtom",
  default: null,
});

export const messageAtom = atom<string | null>({
  key: "messageAtom",
  default: null,
});
export const searchedContactsAtom = atom<
  | {
      contactID: string;
      contactName: string;
      mobileNumber: string;
      hasAccount: boolean;
    }[]
  | null
>({
  key: "searchedContactsAtom",
  default: null,
});
export const contactsAtom = atom<
  | {
      mobileNumber: string;
      savedById: string;
      contactName: string;
      contactId: string;
      friendsUserAccount: {
        id: string;
        email: string;
        mobileNumber: string;
        password: string;
      } | null;
    }[]
  | null
>({
  key: "contactsAtom",
  default: null,
});

export const selectedContactAtom = atom<{
  mobileNumber: string;
  savedById: string;
  contactName: string;
  contactId: string;
  friendsUserAccount: {
    id: string;
    email: string;
    mobileNumber: string;
    password: string;
  } | null;
} | null>({
  key: "selectedContactAtom",
  default: null,
});

export const conversationsAtom = atom<
  | {
      conversation: {
        DateModified: Date;
        conversationParticipants: {
          id: string;
          conversationId: string;
          participantNumber: string;
        }[];
        conversation_id: string;
        conversationName: string | null;
        createdAt: Date;
        ReadStatus: {
          id: string;
        }[];
        type: string;
      };
    }[]
  | null
>({
  key: "conversationsAtom",
  default: null,
});

export const conversationAtom = atom<{
  conversation: {
    DateModified: Date;
    conversationParticipants: {
      id: string;
      conversationId: string;
      participantNumber: string;
    }[];
    conversation_id: string;
    conversationName: string | null;
    createdAt: Date;
    ReadStatus: {
      id: string;
    }[];
    type: string;
  };
} | null>({
  key: "conversationAtom",
  default: null,
});

export const updatedSelectedConversationSelector = selector({
  key: "updatedSelectedConversationSelector",
  get: ({ get }) => {
    const newSelectedConversation = get(conversationAtom);
    const contacts = get(contactsAtom);
    const usersDetails = get(usersDetailsAtom);
    console.log(
      "updat selected conversation triggered: ",
      newSelectedConversation
    );
    if (newSelectedConversation) {
      const otherParticipants =
        newSelectedConversation.conversation.conversationParticipants.filter(
          (participant) =>
            participant.participantNumber !== usersDetails?.myMobileNumber
        );
      console.log("otherParticipants: ", otherParticipants);
      if (
        newSelectedConversation.conversation.type === "GROUP" ||
        otherParticipants.length > 1
      ) {
        console.log("group conversation");
        return {
          ...newSelectedConversation.conversation,
          showAddContactUi: false,
          participantNumber: otherParticipants[0].participantNumber,
        };
      }
      if (!contacts || contacts.length === 0) {
        console.log("no contacts");
        return {
          ...newSelectedConversation.conversation,
          showAddContactUi: true,
          participantNumber: otherParticipants[0].participantNumber,
        };
      }
      const otherParticipantscontact = contacts
        .map((contact, index) => {
          console.log(`contact ${index + 1} is ${contact.contactName}`);
          if (contact.mobileNumber === otherParticipants[0].participantNumber) {
            console.log("contact.mobileNumber: ", contact.mobileNumber);
            console.log(
              "otherParticipants[0].participantNumber: ",
              otherParticipants[0].participantNumber
            );
            return contact;
          } else {
            return null;
          }
        })
        .find((contactFound) => contactFound !== null);

      console.log("other participants contact: ", otherParticipantscontact);
      return otherParticipantscontact
        ? {
            ...newSelectedConversation.conversation,
            conversationName: otherParticipantscontact.contactName,
            showAddContactUi: false,
            participantNumber: otherParticipants[0].participantNumber,
          }
        : {
            ...newSelectedConversation.conversation,
            showAddContactUi: true,
            participantNumber: otherParticipants[0].participantNumber,
          };
    } else {
      console.log("conversation not selected");
      return null;
    }
  },
});

export const conversationParticipantsAtom = atom<string[] | null>({
  key: "conversationParticipantAtom",
  default: null,
});

export const incomingCallAtom = atom({
  key: "incomingCallAtom",
  default: false,
});
export const incomingCallMessageDataAtom = atom<{
  messageType: string;
  callType: string;
  conversationId: string;
} | null>({
  key: "incomingCallMessageDataAtom",
  default: null,
});
export const callAcceptedAtom = atom({
  key: "callAcceptedAtom",
  default: false,
});
export const initiatedCallAtom = atom({
  key: "initiatedCallAtom",
  default: false,
});
export const videoCallInitiatedAtom = atom({
  key: "videoCallInitiatedAtom",
  default: false,
});
export const audioCallInitiatedAtom = atom({
  key: "audioCallInitiatedAtom",
  default: false,
});

export const rtcPeerConnectionInitiatedAtom = atom({
  key: "rtcPeerConnectionInitiatedAtom",
  default: false,
});
export const videoCallAtom = atom({
  key: "videoCallAtom",
  default: false,
});
export const audioCallAtom = atom({
  key: "audioCallAtom",
  default: false,
});
export const myStreamAtom = atom<MediaStream | null>({
  key: "myStreamAtom",
  default: null,
});
export const callTypeAtom = atom<string | null>({
  key: "callTypeAtom",
  default: null,
});
export const remoteTracksAtom = atom<
  | {
      remoteStreamerId: string;
      kind: string;
      track: MediaStreamTrack;
    }[]
  | null
>({
  key: "remoteTracksAtom",
  default: null,
});

export const remoteMediaStreamsSelector = selector({
  key: "remoteMediaStreamsSelector",
  get: ({ get }) => {
    const remoteTracks = get(remoteTracksAtom);
    const callType = get(callTypeAtom);
    if (!remoteTracks) return null;

    const streamMap = new Map<
      string,
      { audioTrack?: MediaStreamTrack; videoTrack?: MediaStreamTrack }
    >();

    remoteTracks.forEach((remoteTrack) => {
      if (!streamMap.has(remoteTrack.remoteStreamerId)) {
        streamMap.set(remoteTrack.remoteStreamerId, {});
      }

      const streamerTracks = streamMap.get(remoteTrack.remoteStreamerId);
      // if (streamerTracks) {
      console.log("streamer tracks: ", streamerTracks);
      if (remoteTrack.kind === "audio") {
        // if(remoteTrack.track.id !== streamerTracks!.audioTrack!.id)
        streamerTracks!.audioTrack = remoteTrack.track;
      } else if (remoteTrack.kind === "video") {
        // remoteTrack.track.id !== streamerTracks!.videoTrack!.id
        streamerTracks!.videoTrack = remoteTrack.track;
      }
      // }
    });
    console.log("streamMap: ", streamMap);
    const result = Array.from(streamMap.entries())
      .map(([remoteStreamerId, { audioTrack, videoTrack }]) => {
        const mediaStream = new MediaStream();
        console.log("callType: ", callType);
        if (callType === "video" && audioTrack && videoTrack) {
          console.log("adding video and audio tracks");
          mediaStream.addTrack(audioTrack);
          mediaStream.addTrack(videoTrack);
          return { remoteStreamerId, mediaStream };
        } else if (callType === "audio" && audioTrack) {
          console.log("adding audio track");

          mediaStream.addTrack(audioTrack);
          return { remoteStreamerId, mediaStream };
        }

        return null;
      })
      .filter((entry) => entry !== null);

    return result;
  },
});

export const callDeclinedAtom = atom({
  key: "callDeclinedAtom",
  default: false,
});

export const displayCallLogsSelectedAtom = atom({
  key: "displayCallLogsSelectedAtom",
  default: false,
});
export const displayContactsSelectedAtom = atom({
  key: "displayContactsSelectedAtom",
  default: false,
});
export const displayConversationsSelectedAtom = atom({
  key: "displayConversationsSelectedAtom",
  default: true,
});
export const contactNameAtom = atom<string | null>({
  key: "contactNameAtom",
  default: null,
});
export const newContactmobileNumberAtom = atom<string | null>({
  key: "newContactmobileNumberAtom",
  default: null,
});
export const availableCamerasAtom = atom<MediaDeviceInfo[]>({
  key: "availableCamerasAtom",
  default: [],
});
export const selectedCameraAtom = atom<MediaDeviceInfo | null>({
  key: "selectedCameraAtom",
  default: null,
});

export const showOptionsForIdAtom = atom<string | null>({
  key: "showOptionsForIdAtom",
  default: null,
});

export const groupCreateParticipantsAtom = atom<{
  [participantNumber: string]: {
    contactId: string;
    participantNumber: string;
    contactName: string;
  };
} | null>({
  key: "groupCreateParticipantsAtom",
  default: null,
});
