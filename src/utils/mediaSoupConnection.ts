import * as mediasoupClient from "mediasoup-client";
import { getMediaStream } from "./getMediaStream";
import { SetterOrUpdater } from "recoil";

let device: mediasoupClient.types.Device | null = null;
let conversationId: string | null = null;
let sendTransport: mediasoupClient.types.Transport<mediasoupClient.types.AppData> | null =
  null;
let recvTransport: mediasoupClient.types.Transport<mediasoupClient.types.AppData> | null =
  null;
let callType: string | null = null;
// let producerss: mediasoupClient.types.Producer<mediasoupClient.types.AppData>[] =
//   [];
let stream: MediaStream | null = null;
// let participantTracks: {
//   [participantId: string]: {
//     [track: string]: MediaStreamTrack;
//   };
// } = {};
async function loadDevice(
  routerRtpCapabilities: mediasoupClient.types.RtpCapabilities
) {
  if (!device) {
    device = new mediasoupClient.Device();
  }
  await device.load({ routerRtpCapabilities });
}
export function initiateCall(
  typeOfCall: "audio" | "video",
  socket: WebSocket | null,
  conversation_id: string,
  myNumber: string
) {
  // console.log(typeOfCall);
  // console.log("call type before assinging", callType);
  callType = typeOfCall;
  // console.log("call type after assinging", callType);
  console.log("initiaing call. sending message to socket: ");
  conversationId = conversation_id;
  socket?.send(
    JSON.stringify({
      messageType: "initiatedCall",
      messageData: {
        conversationId: conversationId,
        myNumber: myNumber,
        callType: callType,
      },
    })
  );
}
export function acceptIncomingCall(
  messageData: any,
  socket: WebSocket | null,
  myNumber: string
) {
  callType = messageData.callType;
  conversationId = messageData.conversationId;
  socket?.send(
    JSON.stringify({
      messageType: "joinCall",
      messageData: {
        conversationId: messageData.conversationId,
        myNumber: myNumber,
        callType: messageData.callType,
        activeCall: messageData.activeCall,
      },
    })
  );
}
export async function requestTransports(
  messageData: any,
  socket: WebSocket | null,
  myNumber: string
) {
  // console.log("device: ", device);
  const routerRtpCapabilities = messageData?.rtpCapabilities;
  // console.log("rtpCapabilities: ", routerRtpCapabilities);
  // console.log(`create ${messageData.transportDirection}Transport first`);
  // console.log("mssageData: ", messageData);
  await loadDevice(routerRtpCapabilities);
  conversationId = conversationId;
  myNumber = myNumber;
  if (messageData.sendTransportFirst) {
    // console.log("sending sendTransport request");
    if (!sendTransport) {
      socket?.send(
        JSON.stringify({
          messageType: "createTransport",
          messageData: {
            direction: "send",
            myNumber: myNumber,
            conversationId: messageData.conversationId,
          },
        })
      );
    }
    if (!recvTransport) {
      // console.log("sending recvTransport request");

      socket?.send(
        JSON.stringify({
          messageType: "createTransport",
          messageData: {
            direction: "receive",
            myNumber: myNumber,
            conversationId: messageData.conversationId,
          },
        })
      );
    }
  } else if (!messageData.sendTransportFirst) {
    if (!recvTransport) {
      // console.log("sending recvTransport request");

      socket?.send(
        JSON.stringify({
          messageType: "createTransport",
          messageData: {
            direction: "receive",
            myNumber: myNumber,
            conversationId: messageData.conversationId,
          },
        })
      );
    }
    if (!sendTransport) {
      // console.log("sending sendTransport request");

      socket?.send(
        JSON.stringify({
          messageType: "createTransport",
          messageData: {
            direction: "send",
            myNumber: myNumber,
            conversationId: messageData.conversationId,
          },
        })
      );
    }
  }
}
export async function createSendTransport(
  messageData: any,
  socket: WebSocket | null,
  userId: string,
  conversationId: string
) {
  // console.log(`create ${messageData.transportDirection}Transport`);
  if (messageData.transportDirection === "send") {
    try {
      sendTransport =
        device &&
        device?.createSendTransport({
          id: messageData.transportId,
          dtlsParameters: messageData.dtlsParameters,
          iceCandidates: messageData.iceCandidates,
          iceParameters: messageData.iceParameters,
        });

      // console.log("createsendtransport: ", messageData);
      // console.log("ice candidates:", messageData.iceCandidates);
      // console.log("transportId on the client: ", sendTransport?.id);
      // console.log("transportId from the server", messageData.transportId);

      // make the type dynamic
      // console.log("Created send transport:", sendTransport);
      sendTransport?.on("connect", ({ dtlsParameters }, callback, errback) => {
        // console.log("connect transport is triggered", dtlsParameters);
        socket?.send(
          JSON.stringify({
            messageType: "connectTransport",
            messageData: {
              direction: "send",
              transportId: sendTransport?.id,
              dtlsParameters: dtlsParameters,
              conversationId: messageData.conversationId,
              userId: userId,
            },
          })
        );
        // console.log(
        //   "send transport connection state",
        //   sendTransport?.connectionState
        // );
        socket &&
          socket.addEventListener("message", (event) => {
            const connectResponseData = JSON.parse(event.data);
            // console.log("messageType:", connectResponseData.messageType);
            // console.log("transportId on the client: ", sendTransport?.id);
            // console.log("transportId from the server", messageData.transportId);
            if (
              connectResponseData.messageType ===
                "sendTransportConnectResponse" &&
              sendTransport?.id === messageData.transportId
            ) {
              // console.log("connected");
              callback();
            } else if (
              connectResponseData.messageType === "connectTransportError" &&
              connectResponseData.transportId === sendTransport?.id
            ) {
              console.error(
                "Transport connection failed:",
                connectResponseData.error
              );
              errback(new Error(connectResponseData.error)); // Use errback for failures
            }
          });
      });

      sendTransport?.on("produce", async (parameters, callback, errback) => {
        try {
          // console.log(
          //   "onproduce event is triggered and sending createproduce request"
          // );
          socket?.send(
            JSON.stringify({
              messageType: "createProduce",
              messageData: {
                kind: parameters.kind,
                rtpParameters: parameters.rtpParameters,
                appData: {
                  ...parameters.appData,
                  transportId: sendTransport?.id,
                  userId: userId,
                  conversationId: messageData.conversationId,
                },
              },
            })
          );

          socket &&
            socket.addEventListener("message", (message) => {
              const messagedata = JSON.parse(message.data);
              if (messagedata.messageType === "createProduceResponse") {
                const id: string = messagedata.produceId;
                // console.log("my createProduce response");
                callback({ id });
              }
            });
        } catch (error: any) {
          errback(error);
        }
      });
      // console.log("callType insde send transport", callType);
      if (callType === "video") {
        // console.log("producing audio and video tracks");

        stream = await getMediaStream("VIDEO");
        // const stream = await navigator.mediaDevices.getUserMedia({
        //   au
        // })

        const videoTrack = stream.getVideoTracks();
        const audioTrack = stream.getAudioTracks();
        // console.log("got tracks");
        // setMyStream(stream);
        // const myVideoStreamElement = document.getElementById(
        //   "myStreamVideoElement"
        // ) as HTMLVideoElement;
        await sendTransport?.produce({
          track: audioTrack[0],
        });
        await sendTransport?.produce({
          track: videoTrack[0],
        });

        // if (myVideoStreamElement) {
        //   myVideoStreamElement.srcObject = stream;
        //   console.log("sending produce requests");

        // } else {
        //   console.log("myvideostream element is null", myVideoStreamElement);
        // }
      } else if (callType === "audio") {
        stream = await getMediaStream("AUDIO");
        const audioTrack = stream.getAudioTracks();

        sendTransport?.produce({ track: audioTrack[0] });
      }
    } catch (error) {
      console.error(error);
    }
  }
}
export async function createRecvTransport(
  messageData: any,
  socket: WebSocket | null,
  userId: string,
  conversationId: string
) {
  // console.log("creating recv transport");
  try {
    recvTransport =
      device &&
      device.createRecvTransport({
        id: messageData.transportId,
        dtlsParameters: messageData.dtlsParameters,
        iceCandidates: messageData.iceCandidates,
        iceParameters: messageData.iceParameters,
      });
    // console.log("sending rectransport connect request");
    socket?.send(
      JSON.stringify({
        messageType: "getProducers",
        messageData: {
          conversationId: messageData.conversationId,
          userId: userId,
        },
      })
    );
    recvTransport?.on("connect", ({ dtlsParameters }, callback, errback) => {
      // console.log("rectransport connect triggered");
      socket?.send(
        JSON.stringify({
          messageType: "connectTransport",
          messageData: {
            transportId: recvTransport?.id,
            dtlsParameters,
            direction: "recv",
            userId: userId,
          },
        })
      );

      socket &&
        socket.addEventListener("message", async (message) => {
          const connectResponseData = JSON.parse(message.data);
          // console.log("messageype: ", connectResponseData.messageType);
          // console.log("transportId on the client: ", recvTransport?.id);
          // console.log("transportId from the server", messageData.transportId);

          if (
            connectResponseData.messageType ===
              "recvTransportConnectResponse" &&
            recvTransport?.id === messageData.transportId
          ) {
            // console.log("transport connected");
            // console.log(
            //   "RecvTransport connection state:",
            //   recvTransport?.connectionState
            // );

            callback();
          } else if (
            connectResponseData.messageType === "connectTransportError" &&
            connectResponseData.transportId === sendTransport?.id
          ) {
            console.error(
              "Transport connection failed:",
              connectResponseData.error
            );
            errback(new Error(connectResponseData.error)); // Use errback for failures
          }
        });
    });
  } catch (error: any) {
    // errback(error);
    console.log(error);
  }
  // });
  // console.log("recv transport", recvTransport);
}
export async function createConsume(
  messageData: any,
  socket: WebSocket | null,
  userId: string,
  conversationId: string
) {
  // console.log("create consume messageType: ", messageData.messageType);
  // console.log("create consume messageData: ", messageData);
  if (!recvTransport || !messageData.producers) {
    console.error("no recvTransport or no producers to consume");
  } else {
    const producers: {
      produceId: string;
      kind: string;
      producedUserId: string;
    }[] = messageData.producers;
    producers.map((producer) => {
      // console.log("producer:", producer);
      socket?.send(
        JSON.stringify({
          messageType: "consume",
          messageData: {
            produceId: producer.produceId,
            transportId: recvTransport?.id,
            rtpCapabilities: device?.rtpCapabilities,
            conversationId: messageData.conversationId,
            producedUserId: producer.producedUserId,
            userId: userId,
          },
        })
      );
    });
  }
}
export async function consumeData(
  messageData: any,
  setRemoteTracks: SetterOrUpdater<
    | {
        remoteStreamerId: string;
        kind: string;
        track: MediaStreamTrack;
      }[]
    | null
  >
) {
  try {
    // console.log("messageType: ", messageData.messageType);

    console.log("ready to consume data");
    console.log("messageData for consumer created:", messageData);
    const consumeData = await recvTransport?.consume({
      id: messageData.consumerId,
      producerId: messageData.producerId,
      kind: messageData.kind,
      rtpParameters: messageData.rtpParameters,
    });

    if (consumeData) {
      console.log("consumeData: ", consumeData);
      // console.log("producerUserId: ", messageData.producedUserId);
      // if (!participantTracks[messageData.producedUserId]) {
      //   participantTracks[messageData.producedUserId] = {};
      // }

      console.log("setting track: ", consumeData.track);
      setRemoteTracks(
        (prevTracks) =>
          consumeData &&
          (prevTracks
            ? [
                ...prevTracks,
                {
                  remoteStreamerId: messageData.producedUserId,
                  kind: messageData.kind,
                  track: consumeData.track,
                },
              ]
            : [
                {
                  remoteStreamerId: messageData.producedUserId,
                  kind: messageData.kind,
                  track: consumeData.track,
                },
              ])
      );
      // consumeData = null;
    }
  } catch (error) {
    console.error("no data to consume", error);
  }
}
// function createMediaStream(participantId: string) {
//   const { audioTrack, videoTrack } = participantTracks[participantId];

//   console.log("participants tracks: ", participantTracks);
//   if (callType === "video") {
//     if (!audioTrack || !videoTrack) {
//       return;
//     }
//     const mediastream = new MediaStream();
//     mediastream.addTrack(audioTrack);
//     mediastream.addTrack(videoTrack);

//     // const remoteVideoDiv = document.getElementById(
//     //   "remoteVideoDiv"
//     // ) as HTMLDivElement;

//     // const videoElement = document.createElement("video");
//     // videoElement.id = `${participantId}-stream`;
//     // videoElement.autoplay = true;
//     // videoElement.playsInline = true;
//     // videoElement.muted = true;
//     // videoElement.srcObject = mediastream;
//     // videoElement.style.border = "black 2px solid";
//     // videoElement.srcObject = mediastream;

//     // videoElement
//     //   .play()
//     //   .catch((err) => console.error("Video playback failed:", err));
//     // remoteVideoDiv?.appendChild(videoElement);
//   } else if (callType === "audio") {
//     if (!audioTrack) {
//       return;
//     }
//     const medistream = new MediaStream([audioTrack]);
//     const audioElement = document.createElement("audio");
//     audioElement.id = `${participantId}-stream`;
//     audioElement.autoplay = true;
//     audioElement.srcObject = medistream;
//   }
// }

export function clearMediaSoupConnection(
  socket: WebSocket | null,
  userId: string,
  // setMyStream: SetterOrUpdater<MediaStream | null>,
  myStream?: MediaStream | null
) {
  socket?.send(
    JSON.stringify({
      messageType: "callEnded",
      messageData: {
        conversationId: conversationId,
        userId: userId,
        transportIds: [sendTransport?.id, recvTransport?.id],
      },
    })
  );
  // producers.forEach((producer) => producer.close());
  if (sendTransport) {
    console.log("closing sendTransport");
    sendTransport.close();
  }

  if (recvTransport) {
    console.log("closing recvTransport");

    recvTransport.close();
  }

  device = null;
  sendTransport = null;
  stream && stream.getTracks().forEach((track) => track.stop());
  sendTransport = null;
  recvTransport = null;

  conversationId = null;

  callType = null;
}
