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
      {true && (
        <div className="w-full h-full ">
          <VideoCall />
        </div>
      )}
      {audioCall && (
        <div className="w-full h-full">
          <AudioCall />
        </div>
      )}
    </div>
  );
}

export default CallProvider;
