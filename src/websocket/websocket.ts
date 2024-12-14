import { WebSocket, WebSocketServer } from "ws";
import http from "http";
import prisma from "../db/prisma/index";
import * as mediasoup from "mediasoup";
import "dotenv/config";
import { callResponse } from "@prisma/client";

class Client {
  clientId: string;
  socket: WebSocket;
  constructor(clientId: string, socket: WebSocket) {
    this.clientId = clientId;
    this.socket = socket;
  }
}
let worker: mediasoup.types.Worker<mediasoup.types.AppData>;
let router: {
  [conversationId: string]: mediasoup.types.Router<mediasoup.types.AppData>;
} = {};
let callsInvolvedIn: {
  [userId: string]: {
    conversationId: string;
    transportIds: string[];
  };
} = {};

let transports: {
  [
    transportId: string
  ]: mediasoup.types.WebRtcTransport<mediasoup.types.AppData>;
} = {};

let onGoingCall: {
  [conversationId: string]: {
    [joinedParticipantId: string]: {
      [produceId: string]: mediasoup.types.Producer<mediasoup.types.AppData>;
    };
  };
} = {};

const server = http.createServer((request, response) => {
  console.log("websocket server");
  response.end("hello");
});

server.listen(8080, "127.0.0.1", () => {
  console.log("server is running");
});

const wss = new WebSocketServer({ server });

const createMediasoupWorker = async () => {
  worker = await mediasoup.createWorker({
    logLevel: "warn",
    rtcMinPort: 10000,
    rtcMaxPort: 10100,
  });

  worker.on("died", () => {
    console.error("mediasoup server died");
    setTimeout(createMediasoupWorker, 1000);
  });
  return worker;
};
createMediasoupWorker();

const clients = new Map<string, Client>();

const openConversations = new Map<string, Set<string>>();
const closeConversations = new Map<string, Set<string>>();

wss.on("connection", async function connection(socket, req) {
  console.log("websocket connected");
  console.log("websocket ready state: ", socket.readyState);
  const connectionUrl = new URL(req.url!, `http://${req.headers.host}`);
  const clientId = connectionUrl.searchParams.get("clientId");

  if (!clientId) {
    console.error("clientId is required");
    socket.send("clientId is required");
    socket.close();
    return;
  }
  const client = clients.get(clientId);
  console.log("client:", clients.has(clientId));

  if (!client || !client.socket) {
    console.log("creating new client and setting them to the map");
    const client = new Client(clientId, socket);

    clientId && clients.set(clientId, client);
  } else {
    console.log("client already present proceeding with the existing client");
  }
  // setInterval(() => {
  //   clients.forEach((client) => {
  //     console.log("client", client.clientId);
  //     console.log("client readystate", client.socket.readyState);
  //   });
  //   // console.log("websocket state: ", socket.readyState);
  // }, 5000);
  let count = 1;

  socket.on("error", (error) => {
    console.error(error);
  });

  socket.on("message", async function message(data, isBinary) {
    try {
      const deStrucutedData = data.toString();
      const conversationData: {
        messageType: string;
        messageData: any;
      } = JSON.parse(deStrucutedData);
      console.log("messageType: ", conversationData.messageType);
      switch (conversationData.messageType) {
        case "openConversation":
          // console.log("openconverstion", conversationData.messageData);
          handleOpenConversation({
            userId: conversationData.messageData.senderId,
            conversationId: conversationData.messageData.conversationId,
          });

          break;
        case "closeConversation":
          handleCloseConversation({
            userId: conversationData.messageData.senderId,
            conversationId: conversationData.messageData.conversationId,
          });
          break;
        case "sendMessage":
          sendMessage(conversationData.messageData, isBinary);
          break;
        case "peerConnectionOffer":
          peerConnectionOffer(conversationData);
          break;
        case "peerConnectionAnswer":
          peerConnectionAnswer(conversationData);
        case "iceCandidate":
          iceCandidate(conversationData);
          break;
        case "initiatedCall":
          callInitiated(conversationData.messageData);
          break;
        case "joinCall":
          sendRtpCapabilities(conversationData.messageData);
          break;
        case "createTransport":
          createTransport(conversationData.messageData);
          break;
        case "connectTransport":
          connectTransport(conversationData.messageData);
          break;
        case "createProduce":
          createProduce(conversationData.messageData);
          break;
        case "consume":
          createConsume(conversationData.messageData);
          break;
        case "getProducers":
          sendProducers(conversationData.messageData);
          break;
        case "callDeclined":
          callDeclined(conversationData.messageData);
          break;
        case "callEnded":
          console.log("call ended data: ", conversationData.messageData);
          clearMediaSoupConnection(
            conversationData.messageData.conversationId,
            conversationData.messageData.transportIds,
            conversationData.messageData.userId
          );
          break;
        case "missedCall":
          break;
        default:
          break;
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  });

  socket.on("close", function close() {
    console.log("clientId", clientId);
    if (clientId) {
      const client = clients.get(clientId);

      if (client) {
        console.log("cleaning client");

        try {
          console.log("callsInvonvedIn: ", callsInvolvedIn[client.clientId]);
          if (callsInvolvedIn) {
            const conversationId =
              callsInvolvedIn[client.clientId]?.conversationId;
            const transportIds = callsInvolvedIn[client.clientId]?.transportIds;
            if (conversationId) {
              clearMediaSoupConnection(conversationId, transportIds, clientId);
            }
          }
          openConversations.delete(clientId);
          closeConversations.delete(clientId);
        } catch (error) {
          console.error(error);
        }
        // socket.close();
        console.log("is client present", clients.has(clientId));
        clients.delete(clientId);
        console.log("after deleting client: ", clients.has(clientId));
      }
      console.log("websocket state in close event: ", socket.readyState);
      console.log("socket connection closed");
    }
  });
});
async function clearMediaSoupConnection(
  conversationId: string,
  transportIds: string[],
  userId: string
) {
  try {
    if (onGoingCall[conversationId]) {
      if (transportIds) {
        transportIds.forEach((transportId) => {
          {
            if (transportId) {
              transports[transportId] && transports[transportId].close();
              delete transports[transportId];
            }
          }
        });
      }

      if (onGoingCall[conversationId] && onGoingCall[conversationId][userId]) {
        console.log("ongoing call user id deleting");
        delete onGoingCall[conversationId][userId];
      }
      const participants = Object.keys(onGoingCall[conversationId]);

      if (participants.length === 0) {
        await prisma.callInformation.updateMany({
          where: {
            callActive: true,
            conversationId: conversationId,
          },
          data: {
            callActive: false,
            callEnded: true,
            callEndedAt: new Date(),
            // callDuration:
          },
        });
        delete onGoingCall[conversationId];
        if (router[conversationId]) {
          router[conversationId].close();
          delete router[conversationId];
        }
      }
    }

    clients.forEach((client) => {
      if (client.clientId !== userId && client.socket) {
        client.socket.send(
          JSON.stringify({
            messageType: "leftTheCall",

            userId: userId,
          })
        );
      }
    });
    delete callsInvolvedIn[userId];
    console.log("ongoing call participants", onGoingCall);
    console.log("transports", transports);
    console.log("involved calls: ", callsInvolvedIn);
    console.log(`router for ${conversationId} is ${router[conversationId]} `);
    console.log("routers:", router);
    console.log("clients: ", clients);
  } catch (error) {
    console.log(error);
  }
}

async function createConsume(messageData: any) {
  try {
    const recvTransport = transports[messageData.transportId];
    console.log(`consume reached`);
    console.log("messageData for consume: ", messageData);
    if (
      !router[messageData.conversationId].canConsume({
        producerId: messageData.produceId,
        rtpCapabilities: messageData.rtpCapabilities,
      })
    ) {
      throw new Error("cannot consume");
    }
    const consume = await recvTransport.consume({
      producerId: messageData.produceId,
      rtpCapabilities: messageData.rtpCapabilities,
    });
    console.log("consumer id:", consume.id);
    console.log("consume data: ", consume);
    // console.log(
    //   `transports for ${messageData.producedUserId}: ${
    //     transports[messageData.producedUserId]
    //   } `
    // );
    const client = clients.get(messageData.userId);
    client?.socket.send(
      JSON.stringify({
        messageType: "consumerCreated",
        producedUserId: messageData.producedUserId,
        producerId: messageData.produceId,
        consumerId: consume.id,
        kind: consume.kind,
        rtpParameters: consume.rtpParameters,
        conversationId: messageData.conversationId,
      })
    );
  } catch (error) {
    console.log(error);
  }
}
async function createProduce(messageData: any) {
  try {
    // console.log(messageData.kind);
    console.log("new produce request");
    console.log("produce requested by: ", messageData.appData.userId);
    const sendTransport = transports[messageData.appData.transportId];
    const user = await prisma.user.findUnique({
      where: {
        id: messageData.appData.userId,
      },
    });
    if (!user) {
      throw new Error("user not found");
    }

    const conversation = await prisma.conversation.findUnique({
      where: {
        conversation_id: messageData.appData.conversationId,
      },
      select: {
        conversationParticipants: {
          select: {
            user: {
              select: {
                id: true,
              },
            },
          },
        },
        conversation_id: true,
      },
    });
    if (!conversation) {
      throw new Error("conversation doesnot exists");
    }

    const produce = await sendTransport.produce({
      kind: messageData.kind,
      rtpParameters: messageData.rtpParameters,
    });
    console.log("produceId is ", produce.id);

    if (!onGoingCall[conversation.conversation_id]) {
      throw new Error("no active call session");
    }

    if (!onGoingCall[conversation.conversation_id][user.id]) {
      onGoingCall[conversation.conversation_id][user.id] = {};
    }
    const participant = onGoingCall[conversation.conversation_id][user.id];
    participant[produce.id] = produce;
    console.log("produce added to ongoing participants", onGoingCall);
    if (clients.has(user.id)) {
      const client = clients.get(user.id);

      client?.socket.send(
        JSON.stringify({
          messageType: "createProduceResponse",
          produceId: produce.id,
          conversationId: conversation.conversation_id,
        })
      );
    }
    for (const participantId of Object.keys(
      onGoingCall[conversation.conversation_id]
    )) {
      console.log("participantId: ", participantId);
      console.log("userId: ", user.id);
      // console.log("sending newproducer notification to joined participants");
      if (participantId === user.id) {
        continue;
      }
      if (clients.has(participantId)) {
        console.log("send new producer notification to ", participantId);

        const client = clients.get(participantId);

        try {
          client?.socket.send(
            JSON.stringify({
              messageType: "newProducer",
              producers: [
                {
                  produceId: produce.id,
                  kind: produce.kind,
                  producedUserId: user.id,
                },
              ],
              conversationId: conversation.conversation_id,
            })
          );
        } catch (error) {
          console.error("Error sending newProducer message: ", error);
        }
      }
    }
  } catch (error) {
    console.log(error);
  }
  // store produce id and send this produce id to all the existing participants
}
async function sendProducers(messageData: any) {
  const producersToSend: {
    produceId: string;
    kind: string;
    producedUserId: string;
  }[] = [];
  // console.log(`sending produce to joinedparticipants `);

  for (const [participantId, producer] of Object.entries(
    onGoingCall[messageData.conversationId]
  )) {
    console.log("participantId", participantId);
    console.log("userId", messageData.userId);
    console.log("participant id is equal to messageData.userId");

    if (participantId === messageData.userId) {
      console.log("participantId", participantId);
      console.log("userId", messageData.userId);
      console.log("participant id is equal to messageData.userId");
      continue;
    }
    for (const [produceId, produce] of Object.entries(producer)) {
      producersToSend.push({
        produceId,
        kind: produce.kind,
        producedUserId: participantId,
      });
    }

    console.log(
      "all joined participants: ",
      onGoingCall[messageData.conversationId]
    );
    console.log("producers to consume: ", producersToSend);
  }
  if (producersToSend.length > 0) {
    const client = clients.get(messageData.userId);
    client?.socket.send(
      JSON.stringify({
        messageType: "producersToConsume",
        conversationId: messageData.conversationId,
        producers: producersToSend,
      })
    );
  }
}
async function connectTransport(messageData: any) {
  console.log(`connect transport reached `);
  console.log(`connect ${messageData.direction}Tranport`);
  console.log("dtls parameters", messageData.dtlsParameters);
  const transportId = messageData.transportId;
  const dtlsParameters = messageData.dtlsParameters;
  console.log("transport id: ", transportId);
  const transport = transports[transportId];
  console.log("tansports: ", transports);
  console.log("transport: ", transport);
  try {
    // console.log("dtls parameters to connect: ", dtlsParameters);
    await transport.connect({ dtlsParameters });

    const client = clients.get(messageData.userId);
    if (client) {
      console.log(`sending ${messageData.direction}TransportConnectResponse`);
      client.socket.send(
        JSON.stringify({
          messageType: `${messageData.direction}TransportConnectResponse`,
          transportId: transportId,
        })
      );
    }
  } catch (error: any) {
    console.error("Transport connect error:", error);
    const client = clients.get(messageData.userId);
    if (client) {
      client.socket.send(
        JSON.stringify({
          messageType: "connectTransportError",
          transportId,
          error: error.message,
        })
      );
    }
  }

  // send all producers of the conversation except this users produceid's to the user to consume
  // send producers only if the connect transport type is receive
  // make ongoing call to store only participants id's and seperately store
}
async function createRouter(callType: string) {
  return await worker.createRouter({
    mediaCodecs:
      callType === "audio"
        ? [
            {
              kind: "audio",
              mimeType: "audio/opus",
              clockRate: 48000,
              channels: 2,
            },
          ]
        : [
            {
              kind: "audio",
              mimeType: "audio/opus",
              clockRate: 48000,
              channels: 2,
            },
            {
              kind: "video",
              mimeType: "video/VP8",
              clockRate: 90000,
            },
          ],
  });
}
async function callInitiated(messageData: any) {
  // need conversationId to send notification to all other participants
  // need my number using which i will send rtpcapabilities

  try {
    const callType: "video" | "audio" =
      messageData.callType === "video" ? "video" : "audio";
    const conversationId: string = messageData.conversationId;
    // if (!router[conversationId]) {
    router[conversationId] = await createRouter(messageData.callType);
    // }
    console.log("callinitiated by: ", conversationId);
    const conversationUsers = await prisma.conversation.findUnique({
      where: {
        conversation_id: conversationId,
      },
      select: {
        conversationParticipants: {
          select: {
            user: {
              select: {
                id: true,
              },
            },
            participantNumber: true,
          },
        },
      },
    });
    if (!conversationUsers) {
      throw new Error("no conversation exists with this id");
    }
    const initiatorData = conversationUsers.conversationParticipants.find(
      (participant) => {
        return participant.participantNumber === messageData.myNumber;
      }
    );
    console.log("initiator data: ", initiatorData);
    if (!initiatorData) {
      throw new Error("initiator data not found");
    }
    const remainingConversationParticipantsIds: string[] =
      conversationUsers.conversationParticipants
        .filter(
          (participant: {
            participantNumber: string;
            user: {
              id: string;
            };
          }) => participant.user.id !== initiatorData?.user.id
        )
        .map(
          (participant: {
            participantNumber: string;
            user: {
              id: string;
            };
          }) => participant.user.id
        );

    if (!onGoingCall[conversationId]) {
      onGoingCall[conversationId] = {};
    }

    if (!callsInvolvedIn[initiatorData.user.id]) {
      callsInvolvedIn[initiatorData.user.id] = {
        conversationId: conversationId,
        transportIds: [],
      };
    }

    callsInvolvedIn[initiatorData.user.id] = {
      conversationId: conversationId,
      transportIds: [],
    };

    if (clients.has(initiatorData?.user.id)) {
      const isCallActive = await prisma.callInformation.findFirst({
        where: {
          callActive: true,
          conversationId: messageData.conversationId,
        },
      });
      if (isCallActive) {
        const client = clients.get(initiatorData.user.id);
        client?.socket.send(
          JSON.stringify({
            messageType: "call is active",
            rtpCapabilities: router[conversationId].rtpCapabilities,
            conversationId: conversationId,
            activeCall: isCallActive,
          })
        );
      } else {
        const activeCall = await prisma.callInformation.create({
          data: {
            callActive: true,
            callEnded: false,
            conversationId: messageData.conversationId,
            callType: callType,
          },
        });
        await prisma.callDescription.create({
          data: {
            callInformationId: activeCall.callInformationId,
            joined: true,
            callDirection: "outGoing",
            userId: initiatorData.user.id,
          },
        });
        console.log("sending router capabilities to:", initiatorData.user.id);
        console.log("clients: ", clients);
        const client = clients.get(initiatorData.user.id);
        client?.socket.send(
          JSON.stringify({
            messageType: "routerCapabilities",
            sendTransportFirst: true,
            rtpCapabilities: router[conversationId].rtpCapabilities,
            conversationId: conversationId,
            activeCall: activeCall,
          })
        );
        remainingConversationParticipantsIds.map(async (participantId) => {
          console.log("sending incomingcall notification to: ", participantId);

          const remoteClient = clients.get(participantId);
          if (remoteClient) {
            await prisma.callDescription.create({
              data: {
                userId: participantId,
                callDirection: "incoming",
                joined: false,
                callInformationId: activeCall.callInformationId,
              },
            });
            remoteClient.socket.send(
              JSON.stringify({
                messageType: "incomingCall",
                callType: messageData.callType,
                conversationId: messageData.conversationId,
                activeCall: activeCall,
              })
            );
          } else {
            console.log("callInformationId: ", activeCall.callInformationId);
            console.log("participantId: ");
            await prisma.callDescription.create({
              data: {
                userId: participantId,
                callDirection: "incoming",
                joined: false,
                callResponse: "missed",
                callInformationId: activeCall.callInformationId,
              },
            });
            client?.socket.send(
              JSON.stringify({ messageType: "friendIsOffline" })
            );
            console.log("socket is not there");
          }
        });
      }
    }
  } catch (error: any) {
    console.error("Error: ", error);
  }
}
async function callDeclined(messageData: any) {
  // send the initiator that the call has been declined, if it is a group call don't bother sending the call declined message to the client, if it is a two way call then send the message.
  try {
    const conversationId: string = messageData.conversationId;
    const userId = messageData.userId;
    console.log("conversationId:", conversationId);
    console.log("userId: ", userId);
    if (!conversationId || "") {
      console.log("conversationId required ", conversationId);
    } else {
      const activeCallInformation = await prisma.callInformation.findFirst({
        where: {
          callActive: true,
          conversationId: conversationId,
        },
        include: {
          conversation: {
            select: {
              conversationParticipants: {
                select: {
                  user: {
                    select: {
                      id: true,
                    },
                  },
                },
              },
            },
          },
        },
      });
      if (activeCallInformation && userId) {
        console.log("updating call response to declined");
        await prisma.callDescription.update({
          where: {
            callInformationId_userId: {
              callInformationId: activeCallInformation.callInformationId,
              userId: userId,
            },
          },
          data: {
            callResponse: "declined",
          },
        });
        if (
          activeCallInformation.conversation.conversationParticipants.length ===
          2
        ) {
          const remoteClientUser =
            activeCallInformation.conversation.conversationParticipants.find(
              (participant) => participant.user.id !== userId
            );
          console.log("clients: ", clients);
          if (remoteClientUser) {
            console.log(
              "sending call declined notification to  ",
              remoteClientUser
            );
            const remoteClient = clients.get(remoteClientUser.user.id);
            if (remoteClient && remoteClient.socket) {
              remoteClient?.socket.send(
                JSON.stringify({
                  messageType: "callDeclined",
                })
              );
            } else {
              console.log("socket is not present");
            }
          }
        }
      } else {
        console.error("no active call or userId is missing:", userId);
      }
    }
  } catch (error) {
    console.log(error);
  }
}

async function sendRtpCapabilities(messageData: any) {
  try {
    const callRouter = router[messageData.conversationId];
    console.log("messageData for joining call: ", messageData);
    const user = await prisma.user.findUnique({
      where: {
        mobileNumber: messageData.myNumber,
      },
      select: {
        id: true,
      },
    });
    if (!user) {
      throw new Error("user not found");
    }
    if (!callRouter) {
      throw new Error("no active call");
    }
    if (!callsInvolvedIn[user.id]) {
      callsInvolvedIn[user.id] = {
        conversationId: messageData.conversationId,
        transportIds: [],
      };
    }
    // console.log("onGoingCall participants before", onGoingCall);
    if (!onGoingCall[messageData.conversationId][user.id]) {
      onGoingCall[messageData.conversationId][user.id] = {};
    }
    // console.log("onGoingCall participants after", onGoingCall);
    // console.log("rtp capabilities", cal)
    console.log(
      "rtpCapabilities: ",
      router[messageData.conversationId].rtpCapabilities
    );
    await prisma.callDescription.update({
      where: {
        callInformationId_userId: {
          callInformationId: messageData.activeCall.callInformationId,
          userId: user.id,
        },
      },
      data: {
        callResponse: "accepted",
        joined: true,
      },
    });
    if (clients.has(user.id)) {
      const client = clients.get(user.id);
      // console.log("sending router capabilities to: ", user.id);
      if (client && client.socket) {
        client?.socket.send(
          JSON.stringify({
            messageType: "routerCapabilities",
            sendTransportFirst: false,
            rtpCapabilities: callRouter.rtpCapabilities,
            conversationId: messageData.conversationId,
          })
        );
      } else {
        console.log("no socket found");
      }
    }
  } catch (error) {
    console.log(error);
  }
}
async function createTransport(messageData: any) {
  try {
    console.log(
      `create ${messageData.direction}transport: `,
      messageData.direction
    );
    const conversationId: string = messageData.conversationId;
    const user = await prisma.user.findUnique({
      where: {
        mobileNumber: messageData.myNumber,
      },
      select: {
        id: true,
      },
    });
    if (!user) {
      throw new Error("user not found");
    }
    const callRouter = router[conversationId];

    const transport = await callRouter.createWebRtcTransport({
      listenIps: [{ ip: "0.0.0.0", announcedIp: process.env.myPublicIP }],
      enableUdp: true,
      enableTcp: true,
      preferUdp: true,
    });

    const transportId = transport.id;
    transports[transportId] = transport;
    console.log("ongoing call participants: ", onGoingCall[conversationId]);
    console.log("transports: ", transports);
    callsInvolvedIn[user.id].transportIds.push(transport.id);
    if (clients.has(user.id)) {
      const client = clients.get(user.id);
      console.log(
        `sending ${messageData.direction}Transport creation info to the client`
      );
      client?.socket.send(
        JSON.stringify({
          messageType:
            messageData.direction === "send"
              ? "sendTransport"
              : "receiveTransport",
          transportDirection: messageData.direction,
          transportId: transport.id,
          iceCandidates: transport.iceCandidates,
          iceParameters: transport.iceParameters,
          dtlsParameters: transport.dtlsParameters,
          conversationId: conversationId,
        })
      );
    }
  } catch (error) {
    console.log("error:", error);
  }
}

async function iceCandidate(conversationData: {
  messageType: string;
  messageData: any;
}) {
  const participantNumber = conversationData.messageData.participantNumber;
  try {
    const userId = await prisma.user.findUnique({
      where: {
        mobileNumber: participantNumber,
      },
      select: {
        id: true,
      },
    });
    if (!userId) {
      throw new Error("participant not found");
    }
    if (clients.has(userId.id)) {
      const client = clients.get(userId.id);
      client?.socket.send(
        JSON.stringify({
          messageType: conversationData.messageType,
          iceCandidateSentBy: conversationData.messageData.myNumber,
          candidate: conversationData.messageData.candidate,
        })
      );
    }
  } catch (error) {}
}

async function peerConnectionOffer(conversationData: {
  messageType: string;

  messageData: any;
}) {
  const participantNumber: string =
    conversationData.messageData.participantNumber;
  const conversationId: string = conversationData.messageData.conversationId;
  const offer: RTCSessionDescriptionInit = conversationData.messageData.offer;

  try {
    if (!participantNumber) {
      throw new Error("peer data is required");
    }
    const conversation = await prisma.conversation.findUnique({
      where: {
        conversation_id: conversationId,
        conversationParticipants: {
          some: {
            participantNumber: participantNumber,
          },
        },
      },
      select: {
        conversationParticipants: {
          select: {
            user: {
              select: {
                id: true,
              },
            },
          },
        },
      },
    });
    if (!conversation) {
      throw new Error("no conversation exists");
    }
    const participantId = await prisma.user.findUnique({
      where: {
        mobileNumber: conversationData.messageData.participantNumber,
      },
    });
    if (!participantId) {
      throw new Error("peer data not found");
    }
    console.log("participantsIds", participantId);
    if (!clients.has(participantId.id)) {
      throw new Error("your friend is offline");
    } else {
      const client = clients.get(participantId.id);
      client?.socket.send(
        JSON.stringify({
          messageType: conversationData.messageType,
          peerConnectionType: conversationData.messageData.peerConnectionType,
          offer: offer,
          offerMadeBy: conversationData.messageData.offerMadeBy,
          conversationId: conversationData.messageData.conversationId,
        })
      );
    }
  } catch (error) {
    console.error("Error sending message:", error);
  }
}
async function peerConnectionAnswer(conversationData: {
  messageType: string;
  messageData: any;
}) {
  const participant = await prisma.user.findUnique({
    where: {
      mobileNumber: conversationData.messageData.participantNumber,
    },
    select: {
      id: true,
    },
  });
  if (!participant) {
    throw new Error("peer data not found");
  }
  if (clients.has(participant.id)) {
    const client = clients.get(participant.id);
    client?.socket.send(
      JSON.stringify({
        messageType: conversationData.messageType,
        conversationId: conversationData.messageData.conversationId,
        answerMadeBy: conversationData.messageData.answerMadeBy,
        peerConnectionType: conversationData.messageData.peerConnectionType,
        answer: conversationData.messageData.answer,
      })
    );
  } else {
    throw new Error("client is not online");
  }
}
async function handleOpenConversation({
  userId,
  conversationId,
}: {
  userId: string;
  conversationId: string;
}) {
  if (!openConversations.has(userId)) {
    openConversations.set(userId, new Set());
  }
  if (closeConversations.has(userId)) {
    closeConversations.get(userId)?.delete(conversationId);
  }
  if (conversationId) {
    openConversations.get(userId)?.add(conversationId);
    await prisma.readStatus.updateMany({
      where: {
        userId: userId,
        conversationId: conversationId,
      },
      data: {
        isRead: true,
      },
    });
  }
}
function handleCloseConversation({
  userId,
  conversationId,
}: {
  userId: string;
  conversationId: string;
}) {
  if (!closeConversations.has(userId)) {
    closeConversations.set(userId, new Set());
  }
  if (openConversations.has(userId)) {
    openConversations.get(userId)?.delete(conversationId);
  }
  if (conversationId) {
    closeConversations.get(userId)?.add(conversationId);
  }
}

async function sendMessage(
  conversationData: {
    type: string;
    messageContent: string;
    conversationId: string;
    conversationParticipants: string[];
    senderId: string;
  },
  isBinary: boolean
) {
  try {
    if (conversationData.messageContent === "") {
      throw new Error("content cannot be empty");
    }
    const messageData = await prisma.message.create({
      data: {
        content: conversationData.messageContent,
        conversationId: conversationData.conversationId,
        messageSentBy: conversationData.senderId,
        ReadStatus: {
          create: {
            userId: conversationData.senderId,
            conversationId: conversationData.conversationId,
            isRead: true,
          },
        },
      },
      include: {
        conversation: {
          include: {
            conversationParticipants: {
              select: {
                user: {
                  select: {
                    id: true,
                  },
                },
              },
            },
          },
        },
        ReadStatus: {
          select: {
            id: true,
            conversationId: true,
            isRead: true,
            readAt: true,
          },
        },
      },
    });

    await prisma.conversation.update({
      where: {
        conversation_id: conversationData.conversationId,
      },
      data: {
        DateModified: new Date(),
      },
    });

    const participants: {
      user: {
        id: string;
      };
    }[] = messageData.conversation.conversationParticipants;
    const readStatusData = participants
      .filter(
        (participant) => participant.user.id !== conversationData.senderId
      )
      .map((participant) => ({
        userId: participant.user.id,
        messageId: messageData.message_id,
        conversationId: messageData.conversationId,
        isRead: false,
      }));
    await prisma.readStatus.createMany({
      data: readStatusData,
    });
    const outgoingMessage = {
      messagecontent: conversationData.messageContent,
      conversationId: conversationData.conversationId,
      messageId: messageData.message_id,
      messageSentBy: conversationData.senderId,
      createdAt: messageData.createdAt,
      ReadStatus: messageData.ReadStatus,
    };

    participants.forEach(({ user }) => {
      const client = clients.get(user.id);
      if (client) {
        console.log("sending message");
        if (
          openConversations
            .get(user.id)
            ?.has(conversationData.conversationId) ||
          !closeConversations
        ) {
          client.socket.send(
            JSON.stringify({
              messageType: "newMessage",
              conversationId: conversationData.conversationId,
              outgoingMessage,
            })
          );
        } else {
          client.socket.send(
            JSON.stringify({
              messageType: "unreadMessage",
              conversationId: conversationData.conversationId,
            })
          );
        }
      }
    });
  } catch (error) {
    console.error(`Error sending message to user`, error);
  }
}
