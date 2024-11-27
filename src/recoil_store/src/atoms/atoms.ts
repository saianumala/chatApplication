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
    }[]
  | null
>({
  key: "searchedContactsAtom",
  default: null,
});
export const contactsAtom = atom<
  | {
      contactId: string;
      savedById: string;
      mobileNumber: string;
      contactName: string;
    }[]
  | null
>({
  key: "contactsAtom",
  default: null,
});

export const selectedContactAtom = atom<{
  contactId: string;
  savedById: string;
  mobileNumber: string;
  contactName: string;
} | null>({
  key: "selectedContactAtom",
  default: null,
});

export const conversationsAtom = atom<
  | {
      conversation: {
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
      };
    }[]
  | null
>({
  key: "conversationsAtom",
  default: null,
});

export const conversationAtom = atom<{
  conversation: {
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
  };
} | null>({
  key: "conversationAtom",
  default: null,
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
