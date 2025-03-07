import { useEffect, useState } from "react";
import Button from "./button";
import { useRecoilValue } from "recoil";
import { contactsAtom } from "@/recoil_store/src/atoms/atoms";
import { useSession } from "next-auth/react";

export function CallLogs() {
  //
  const { data: session } = useSession();
  const [callLogs, setCallLogs] = useState<
    {
      callDirection: string;
      callDescriptionId: string;
      joined: boolean;
      callInformationId: string;
      callResponse: string | null;

      callInformation: {
        conversation: {
          conversationName: string | null;
          conversationParticipants: {
            user: {
              myContacts: {
                contactId: string;
                savedById: string;
                mobileNumber: string;
                contactName: string;
              }[];
              contactSavedBy: {
                mobileNumber: string;
                savedById: string;
                contactName: string;
              }[];
            };
            participantNumber: string;

            // id: string;
            // conversationId: string;
          }[];
        };
        callActive: string;
        callStartedAt: string;
        callType: string;
        callEndedAt: string;
      };
    }[]
  >();

  const contacts = useRecoilValue(contactsAtom);
  function dateTimeToDisplay(createdAt: string) {
    const callDate = new Date(createdAt);
    const now = new Date();
    const diffInMilliSec = now.getTime() - callDate.getTime();
    const diffInMinutes: number = Math.floor(diffInMilliSec / 60000);
    if (diffInMinutes < 60) {
      return `${diffInMinutes} minute${diffInMinutes !== 1 ? "s" : ""} ago`;
    }

    const isSameDay = (d1: Date, d2: Date) =>
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate();

    const isYesterday = (d1: Date, d2: Date) => {
      const yesterday = new Date(d2);
      yesterday.setDate(d2.getDate() - 1);
      return isSameDay(d1, yesterday);
    };

    if (isSameDay(callDate, now)) {
      const formatter = new Intl.DateTimeFormat("en-US", {
        hour: "numeric",
        minute: "numeric",
        hour12: true,
      });
      return `Today at ${formatter.format(callDate)}`;
    }

    if (isYesterday(callDate, now)) {
      const formatter = new Intl.DateTimeFormat("en-US", {
        hour: "numeric",
        minute: "numeric",
        hour12: true,
      });
      return `Yesterday at ${formatter.format(callDate)}`;
    }
    const formatter = new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    });
    return formatter.format(callDate);
  }
  function getCallLogName(callLog: {
    callDirection: string;
    callDescriptionId: string;
    joined: boolean;
    callInformationId: string;
    callResponse: string | null;
    callInformation: {
      conversation: {
        conversationName: string | null;
        conversationParticipants: {
          user: {
            myContacts: {
              contactId: string;
              savedById: string;
              mobileNumber: string;
              contactName: string;
            }[];
            contactSavedBy: {
              mobileNumber: string;
              savedById: string;
              contactName: string;
            }[];
          };
          participantNumber: string;
        }[];
      };
      callActive: string;
      callStartedAt: string;
      callType: string;
      callEndedAt: string;
    };
  }) {
    if (callLog.callInformation.conversation.conversationName) {
      return callLog.callInformation.conversation.conversationName;
    } else {
      const friends =
        callLog.callInformation.conversation.conversationParticipants.filter(
          (participant) =>
            participant.participantNumber !== session?.user.mobileNumber
        );
      const contact = friends[0].user.contactSavedBy.find(
        (savedByUser) => savedByUser.savedById === session?.user.userId
      );
      return contact ? contact.contactName : friends[0].participantNumber;
    }
  }
  useEffect(() => {
    fetch("/api/callLogs")
      .then(async (response) => {
        const respData = await response.json();
        console.log(respData.callLogs[0].callInformation.callStartedAt);
        console.log(typeof respData.callLogs[0].callInformation.callStartedAt);
        setCallLogs(respData.callLogs);
      })
      .catch((error) => console.error(error));
  }, []);
  return (
    <div className="w-full h-full">
      <div className="h-full w-full overflow-y-auto ">
        {callLogs?.map((callLog) => {
          const DatTimeToDisplay = dateTimeToDisplay(
            callLog.callInformation.callStartedAt
          );
          const nameOfCallLog = getCallLogName(callLog);
          return (
            <div
              key={callLog.callDescriptionId}
              className="flex justify-evenly items-center w-full gap-2 p-2 bg-slate-700 m-2"
            >
              <h2 className="w-[25px] h-[25px] object-cover rounded-full bg-white">
                dp
              </h2>
              <div className="flex-1">
                <div className="flex flex-col bg-slate-400">
                  <div>
                    <h2>{nameOfCallLog}</h2>
                  </div>
                  <div className="flex">
                    {callLog.callDirection === "incoming" && (
                      <div className="flex">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          height="24px"
                          viewBox="0 -960 960 960"
                          width="24px"
                          className={`${
                            callLog.callResponse === "missed" ||
                            callLog.callResponse === "declined"
                              ? "fill-red-600"
                              : "fill-green-600"
                          }`}
                        >
                          <path d="M200-200v-400h80v264l464-464 56 56-464 464h264v80H200Z" />
                        </svg>
                        <h2>{DatTimeToDisplay}</h2>
                      </div>
                    )}
                    {callLog.callDirection === "outGoing" && (
                      <div className="flex">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          height="24px"
                          viewBox="0 -960 960 960"
                          width="24px"
                          className={`${
                            callLog.callResponse === "missed" ||
                            callLog.callResponse === "declined"
                              ? "fill-red-600"
                              : "fill-green-600"
                          }`}
                        >
                          <path d="m216-160-56-56 464-464H360v-80h400v400h-80v-264L216-160Z" />
                        </svg>
                        <h2>{DatTimeToDisplay}</h2>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              {/* type of call icon and functionality to call */}
              <div className="w-[40px]">
                {callLog.callInformation.callType === "video" &&
                  !callLog.callInformation.callActive && (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      height="24px"
                      viewBox="0 -960 960 960"
                      width="24px"
                      className={`${
                        callLog.callResponse === "missed" ||
                        callLog.callResponse === "declined"
                          ? "fill-red-600"
                          : "fill-green-600"
                      }`}
                    >
                      <path d="M160-160q-33 0-56.5-23.5T80-240v-480q0-33 23.5-56.5T160-800h480q33 0 56.5 23.5T720-720v180l160-160v440L720-420v180q0 33-23.5 56.5T640-160H160Zm0-80h480v-480H160v480Zm0 0v-480 480Z" />
                    </svg>
                  )}
                {callLog.callInformation.callType === "audio" &&
                  !callLog.callInformation.callActive && (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      height="24px"
                      viewBox="0 -960 960 960"
                      width="24px"
                      className={`${
                        callLog.callResponse === "missed" ||
                        callLog.callResponse === "declined"
                          ? "fill-red-600"
                          : "fill-green-600"
                      }`}
                    >
                      <path d="M798-120q-125 0-247-54.5T329-329Q229-429 174.5-551T120-798q0-18 12-30t30-12h162q14 0 25 9.5t13 22.5l26 140q2 16-1 27t-11 19l-97 98q20 37 47.5 71.5T387-386q31 31 65 57.5t72 48.5l94-94q9-9 23.5-13.5T670-390l138 28q14 4 23 14.5t9 23.5v162q0 18-12 30t-30 12ZM241-600l66-66-17-94h-89q5 41 14 81t26 79Zm358 358q39 17 79.5 27t81.5 13v-88l-94-19-67 67ZM241-600Zm358 358Z" />
                    </svg>
                  )}
                {callLog.callInformation.callActive && (
                  <button className="bg-green-600 animate-pulse">Join</button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
