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
let myStream: MediaStream | null = null;
// let participantTracks: {
//   [participantId: string]: {
//     [track: string]: MediaStreamTrack;
//   };
// } = {};
let audioProduce:
  | mediasoupClient.types.Producer<mediasoupClient.types.AppData>
  | undefined = undefined;
let videoProduce:
  | mediasoupClient.types.Producer<mediasoupClient.types.AppData>
  | undefined = undefined;
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
  const routerRtpCapabilities = messageData?.rtpCapabilities;

  await loadDevice(routerRtpCapabilities);
  conversationId = conversationId;
  myNumber = myNumber;

  if (messageData.sendTransportFirst) {
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

      sendTransport?.on("connect", ({ dtlsParameters }, callback, errback) => {
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

        socket &&
          socket.addEventListener("message", (event) => {
            const connectResponseData = JSON.parse(event.data);

            if (
              connectResponseData.messageType ===
                "sendTransportConnectResponse" &&
              sendTransport?.id === messageData.transportId
            ) {
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
                callback({ id });
              }
            });
        } catch (error: any) {
          errback(error);
        }
      });
      if (callType === "video") {
        myStream = await getMediaStream("VIDEO");
        if (myStream) {
          const videoTrack = myStream.getVideoTracks();
          const audioTrack = myStream.getAudioTracks();

          audioProduce = await sendTransport?.produce({
            track: audioTrack[0],
          });
          videoProduce = await sendTransport?.produce({
            track: videoTrack[0],
          });
        } else {
          console.log("my stream is empty: ", myStream);
        }
      } else if (callType === "audio") {
        const myStream = await getMediaStream("AUDIO");
        if (myStream) {
          const audioTrack = myStream.getAudioTracks();

          sendTransport?.produce({ track: audioTrack[0] });
        }
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
    }
  } catch (error) {
    console.error("no data to consume", error);
  }
}
export async function changeCamera(cameraId: string) {
  console.log("reached change camera. cameraId is ", cameraId);
  try {
    const newStream = await navigator.mediaDevices.getUserMedia({
      video: {
        deviceId: cameraId,
      },
    });
    console.log(newStream);
    const videoTrack = newStream.getVideoTracks()[0];
    console.log("new track", videoTrack);
    if (videoProduce) {
      await videoProduce.replaceTrack({
        track: videoTrack,
      });
      const videoElement = document.getElementById(
        "myStreamVideoElement"
      ) as HTMLVideoElement;
      videoElement.srcObject = newStream;
      console.log("Track replaced successfully!");
    } else {
      console.error(
        "No video producer available to replace track.",
        videoProduce
      );
    }
  } catch (error) {
    console.error(error);
  }
}
export function clearMediaSoupConnection(
  socket: WebSocket | null,
  userId: string
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
  audioProduce && audioProduce?.close();
  videoProduce && videoProduce?.close();
  myStream && myStream.getTracks().forEach((track) => track.stop());
  myStream = null;
  sendTransport = null;
  recvTransport = null;

  conversationId = null;

  callType = null;
}
