// import { Html } from "next/document";
// import { getMediaStream } from "./getMediaStream";
// import { SetterOrUpdater } from "recoil";

// const rtcPeerconnections = new Map<string, RTCPeerConnection>();
// const iceCandidates = new Map<string, RTCIceCandidate[]>();
// export function peerConnection() {
//   let incomingOfferVar: RTCSessionDescriptionInit;
//   const peerConnectionConfiguration = {
//     iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
//   };

//   function addIceCandidates(messageData: any) {
//     const pc = rtcPeerconnections.get(messageData.iceCandidateSentBy);
//     if (pc && pc?.remoteDescription) {
//       pc?.addIceCandidate(messageData.candidate);
//     }
//     if (!iceCandidates.has(messageData.iceCandidateSentBy)) {
//       iceCandidates.set(messageData.iceCandidateSentBy, []);
//     }
//     iceCandidates
//       .get(messageData?.iceCandidateSentBy)
//       ?.push(messageData.candidate);
//   }
//   function initiateCall(
//     type: "VIDEO" | "AUDIO",
//     conversationId: string | undefined,
//     myNumber: string | undefined,
//     participantNumbers: string[],
//     socket: WebSocket | null
//   ) {
//     console.log("call initiated");
//     getMediaStream(type)
//       .then((myStream) => {
//         const myStreamVideoElement = document.getElementById(
//           "myStreamVideoElement"
//         ) as HTMLVideoElement;

//         myStreamVideoElement.srcObject = myStream;

//         participantNumbers.forEach((participantNumber) => {
//           const pc = new RTCPeerConnection(peerConnectionConfiguration);
//           rtcPeerconnections.set(participantNumber, pc);
//           pc.ontrack = (event) => {
//             console.log("ontrack event: ", event);

//             const remoteStream = event.streams[0];
//             const videoElement = document.getElementById(
//               "remoteStreamVideoElement"
//             ) as HTMLVideoElement;

//             videoElement.srcObject = remoteStream;
//             videoElement
//               .play()
//               .catch((error) => console.error("Error playing video:", error));
//             console.log(rtcPeerconnections);
//           };
//           pc.onicecandidate = (event) => {
//             if (event.candidate) {
//               socket?.send(
//                 JSON.stringify({
//                   messageType: "iceCandidate",
//                   messageData: {
//                     candidate: event.candidate,
//                     participantNumber: participantNumber,
//                     conversationId: conversationId,
//                     myNumber: myNumber,
//                   },
//                 })
//               );
//             }
//           };

//           myStream.getTracks().forEach((track) => pc.addTrack(track, myStream));
//           pc.createOffer()
//             .then((offer) => {
//               pc.setLocalDescription(offer);
//               socket?.send(
//                 JSON.stringify({
//                   messageType: "peerConnectionOffer",
//                   messageData: {
//                     conversationId: conversationId,
//                     participantNumber: participantNumber,
//                     offerMadeBy: myNumber,
//                     peerConnectionType: type === "VIDEO" ? "VIDEO" : "AUDIO",
//                     offer: offer,
//                   },
//                 })
//               );
//             })
//             .catch((error) => console.error(error));
//           console.log(rtcPeerconnections);
//         });
//       })
//       .catch((error) => console.error(error));
//   }
//   function incomingAnswer(messageData: any) {
//     console.log(
//       "rtcPeerconnections before setting remote description",
//       rtcPeerconnections
//     );
//     if (messageData.answer) {
//       const pc = rtcPeerconnections.get(messageData.answerMadeBy);
//       pc?.setRemoteDescription(messageData.answer).then(() => {
//         console.log(
//           "rtcPeerconnections after setting remote description",
//           rtcPeerconnections
//         );
//         console.log(rtcPeerconnections);
//         const icecandidates = iceCandidates.get(messageData.answerMadeBy);
//         icecandidates?.map((icecandidate) => {
//           pc.addIceCandidate(icecandidate);
//         });
//         iceCandidates.clear();
//       });
//     }
//   }

//   function incomingOffer(
//     messageData: {
//       messageType: string;
//       peerConnectionType: string;
//       offer: RTCSessionDescriptionInit;
//       offerMadeBy: string;
//       conversationId: string;
//     },
//     myNumber: string | undefined,
//     socket: WebSocket | null,
//     callAccepted: boolean
//   ) {
//     getMediaStream(
//       messageData.peerConnectionType === "VIDEO" ? "VIDEO" : "AUDIO"
//     ).then((myStream) => {
//       const myStreamVideoElement = document.getElementById(
//         "myStreamVideoElement"
//       ) as HTMLVideoElement;
//       console.log("myStreamVideoElement", myStreamVideoElement);
//       myStreamVideoElement.srcObject = myStream;

//       console.log("inside call accepted check");
//       console.log(messageData);
//       const pc = new RTCPeerConnection(peerConnectionConfiguration);
//       rtcPeerconnections.set(messageData.offerMadeBy, pc);
//       pc.ontrack = (event) => {
//         const remoteStream = event.streams[0];
//         console.log("ontrack event", event);

//         const remoteVideoElement = document.getElementById(
//           "remoteStreamVideoElement"
//         ) as HTMLVideoElement;
//         console.log("remoteVideoElement", remoteVideoElement);
//         if (remoteVideoElement) {
//           remoteVideoElement.srcObject = remoteStream;
//           remoteVideoElement
//             .play()
//             .catch((error) => console.error("Error playing video:", error));
//         }
//       };
//       pc.onicecandidate = (event) => {
//         if (event.candidate) {
//           socket?.send(
//             JSON.stringify({
//               messageType: "iceCandidate",
//               messageData: {
//                 candidate: event.candidate,
//                 participantNumber: messageData.offerMadeBy,
//                 conversationId: messageData.conversationId,
//                 myNumber: myNumber,
//               },
//             })
//           );
//         }
//       };

//       const tracks = myStream.getTracks();
//       tracks.forEach((track) => pc.addTrack(track, myStream));
//       pc.setRemoteDescription(messageData.offer).then(() => {
//         const icecandidates = iceCandidates.get(messageData.offerMadeBy);
//         icecandidates?.map((icecandidate) => {
//           pc.addIceCandidate(icecandidate);
//         });
//         iceCandidates.clear();
//       });
//       console.log(pc);

//       pc.createAnswer()
//         .then((answer) => {
//           pc.setLocalDescription(answer);
//           socket?.send(
//             JSON.stringify({
//               messageType: "peerConnectionAnswer",
//               messageData: {
//                 conversationId: messageData.conversationId,
//                 participantNumber: messageData.offerMadeBy,
//                 answerMadeBy: myNumber,
//                 peerConnectionType: messageData.peerConnectionType,
//                 answer: answer,
//               },
//             })
//           );
//         })
//         .catch((error) => console.error());
//     });
//   }
//   return { initiateCall, incomingAnswer, incomingOffer, addIceCandidates };
// }
