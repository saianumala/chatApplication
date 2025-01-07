"use client";
import React from "react";
import VideoCall from "@/components/videoCall";
import { useRecoilValue } from "recoil";
import { audioCallAtom, videoCallAtom } from "@/recoil_store/src/atoms/atoms";
import { AudioCall } from "./audioCall";

function CallProvider() {
  const audioCall = useRecoilValue(audioCallAtom);
  const videoCall = useRecoilValue(videoCallAtom);
  return (
    <div className="w-full h-full">
      {videoCall && (
        <div className="max-w-[350px] max-h-[95%] sm:max-w-full sm:max-h-full absolute  top-2/4 left-2/4 bg-black z-10 sm:w-3/4 sm:h-3/4 w-full h-full object-cover -translate-y-2/4 -translate-x-2/4">
          <VideoCall />
        </div>
      )}
      {audioCall && (
        <div className="max-w-[350px] max-h-[95%] sm:max-w-[350px] sm:max-h-full absolute  top-2/4 left-2/4 bg-black z-10 sm:w-3/4 sm:h-3/4 w-full h-full object-cover -translate-y-2/4 -translate-x-2/4">
          <AudioCall />
        </div>
      )}
    </div>
  );
}

export default CallProvider;
