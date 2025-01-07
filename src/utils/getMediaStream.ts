let stream: MediaStream | null = null;
export async function getMediaStream(type: "VIDEO" | "AUDIO") {
  console.log("strema", stream);
  const mediaConstraints: MediaStreamConstraints = {};

  if (type === "VIDEO") {
    mediaConstraints.video = {
      width: { ideal: 1920 },
      height: { ideal: 1080 },
      frameRate: { ideal: 30, max: 60 },
    };
    mediaConstraints.audio = {
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true,
    };
  } else if (type === "AUDIO") {
    mediaConstraints.audio = {
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true,
    };
  }
  if (!stream) {
    stream = await navigator.mediaDevices.getUserMedia(mediaConstraints);
  }

  return stream;
}
export function clearMediaStream() {
  if (stream) {
    console.log("before clearing stream in getmediastream", stream);

    stream?.getTracks().forEach((track) => track.stop());
    stream = null;
    console.log("after clearing stream", stream);
  }
}
