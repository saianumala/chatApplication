"use client";
import React from "react";
import VideoCall from "@/components/videoCall";
import { useRecoilValue } from "recoil";
import { audioCallAtom, videoCallAtom } from "@/recoil_store/src/atoms/atoms";

function CallProvider() {
  const audioCall = useRecoilValue(audioCallAtom);
  const videoCall = useRecoilValue(videoCallAtom);
  return (
    <div className="w-3/4 h-3/4">
      {videoCall && (
        <div className="absolute w-2/4 h-2/4 left-2/4 top-2/4 transform -translate-x-2/4 -translate-y-2/4">
          <VideoCall />
        </div>
      )}
      {audioCall && (
        <div className="absolute w-3/4 h-3/4 left-2/4 top-2/4 transform -translate-x-2/4 -translate-y-2/4">
          {/* <AudioCall /> */}
        </div>
      )}
    </div>
  );
}

export default CallProvider;
