import React from "react";

const AudioDisplay = () => {
  return (
    <div className="relative bg-slate-400 w-full h-full">
      <div className="flex justify-center items-center w-full h-full">
        <div className="text-center w-[150px] rounded-full object-cover bg-black text-white h-[150px]">
          Dp
        </div>
      </div>
      <div className="absolute rounded-full w-[35px] transition-all ease-in -translate-x-2/4 left-2/4 bottom-10">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          height="35px"
          viewBox="0 -960 960 960"
          width="35px"
          fill="#e8eaed"
          className="-full p-2 hover:cursor-pointer  bg-green-800"
          onClick={() => {
            // setCallEnded(false);
            // acceptIncomingCall(
            //   incomingCallMessageData,
            //   socket,
            //   session?.user.mobileNumber || ""
            // );
            // setIncomingCall(false);
            // setCallAccepted(true);
          }}
        >
          <path d="M796-120q-119 0-240-55.5T333-333Q231-435 175.5-556T120-796q0-18.86 12.57-31.43T164-840h147.33q14 0 24.34 9.83Q346-820.33 349.33-806l26.62 130.43q2.05 14.9-.62 26.24-2.66 11.33-10.82 19.48L265.67-530q24 41.67 52.5 78.5T381-381.33q35 35.66 73.67 65.5Q493.33-286 536-262.67l94.67-96.66q9.66-10.34 23.26-14.5 13.61-4.17 26.74-2.17L806-349.33q14.67 4 24.33 15.53Q840-322.27 840-308v144q0 18.86-12.57 31.43T796-120ZM233-592l76-76.67-21-104.66H187q3 41.66 13.67 86Q211.33-643 233-592Zm365.33 361.33q40.34 18.34 85.84 29.67 45.5 11.33 89.16 13.67V-288l-100-20.33-75 77.66ZM233-592Zm365.33 361.33Z" />
        </svg>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          height="35px"
          viewBox="0 -960 960 960"
          width="35px"
          fill="#e8eaed"
          className="-full p-2 hover:cursor-pointer  bg-red-800"
          onClick={() => {
            // setCallEnded(true);
          }}
        >
          <path d="M796-120q-119 0-240-55.5T333-333Q231-435 175.5-556T120-796q0-18.86 12.57-31.43T164-840h147.33q14 0 24.34 9.83Q346-820.33 349.33-806l26.62 130.43q2.05 14.9-.62 26.24-2.66 11.33-10.82 19.48L265.67-530q24 41.67 52.5 78.5T381-381.33q35 35.66 73.67 65.5Q493.33-286 536-262.67l94.67-96.66q9.66-10.34 23.26-14.5 13.61-4.17 26.74-2.17L806-349.33q14.67 4 24.33 15.53Q840-322.27 840-308v144q0 18.86-12.57 31.43T796-120ZM233-592l76-76.67-21-104.66H187q3 41.66 13.67 86Q211.33-643 233-592Zm365.33 361.33q40.34 18.34 85.84 29.67 45.5 11.33 89.16 13.67V-288l-100-20.33-75 77.66ZM233-592Zm365.33 361.33Z" />
        </svg>
      </div>
    </div>
  );
};

export default AudioDisplay;
