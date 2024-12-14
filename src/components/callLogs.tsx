import { useEffect, useState } from "react";
import Button from "./button";

export function CallLogs() {
  //
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
            id: string;
            conversationId: string;
            participantNumber: string;
          }[];
        };
        callActive: true;
        callStartedAt: string;
        callType: string;
        callEndedAt: Date;
      };
    }[]
  >();
  useEffect(() => {
    fetch("/api/callLogs")
      .then(async (JSONresponse) => {
        const respData = await JSONresponse.json();
        console.log(respData);
        setCallLogs(respData.callLogs);
      })
      .catch((error) => console.error(error));
  }, []);
  return (
    <div className="w-full h-full">
      <div className="overflow-y-auto h-full w-full">
        {callLogs?.map((callLog) => (
          <div
            key={callLog.callDescriptionId}
            className="flex gap-2 overflow-y-auto"
          >
            <h2>dp</h2>
            <div className="flex flex-col">
              <div>
                <h2>name of the freind</h2>
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
                    <h2>{callLog.callInformation.callStartedAt}</h2>
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
                    <h2>{callLog.callInformation.callStartedAt}</h2>
                  </div>
                )}
              </div>
            </div>
            {/* type of call icon and functionality to call */}
            <div>
              {callLog.callInformation.callType === "video" && (
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
              {callLog.callInformation.callType === "audio" && (
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
                <button className="bg-green-600">Join</button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
