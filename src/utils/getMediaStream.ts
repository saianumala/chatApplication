export async function getMediaStream(type: "VIDEO" | "AUDIO") {
  const mediaConstraints: MediaStreamConstraints = {};

  if (type === "VIDEO") {
    mediaConstraints.video = {
      width: { ideal: 1920 },
      height: { ideal: 1080 },
      frameRate: { ideal: 30, max: 60 },
    };
    mediaConstraints.audio = {
      echoCancellation: true,
    };
  } else if (type === "AUDIO") {
    mediaConstraints.audio = {
      echoCancellation: true,
    };
  }

  return await navigator.mediaDevices.getUserMedia(mediaConstraints);
}
