export async function getMediaStream(type: "VIDEO" | "AUDIO") {
  const mediaConstraints: MediaStreamConstraints = {};

  if (type === "VIDEO") {
    mediaConstraints.video = {
      width: 1280,
      height: 720,
      frameRate: 30,
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
