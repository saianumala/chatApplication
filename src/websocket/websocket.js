"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ws_1 = require("ws");
const http_1 = __importDefault(require("http"));
const index_1 = __importDefault(require("../db/prisma/index"));
const mediasoup = __importStar(require("mediasoup"));
class Client {
    constructor(clientId, socket) {
        this.clientId = clientId;
        this.socket = socket;
    }
}
let worker;
let router = {};
// let producers: {
//   [conversationId: string]: {
//     [produceId:string]: mediasoup.types.Producer<mediasoup.types.AppData>;
//   }
// } = {};
let consumers = {};
let transports = {};
let onGoingCall = {};
const server = http_1.default.createServer((request, response) => {
    console.log("wwebsocket server");
    response.end("hello");
});
server.listen(8080, () => {
    console.log("server is running");
});
const wss = new ws_1.WebSocketServer({ server });
const createMediasoupWorker = () => __awaiter(void 0, void 0, void 0, function* () {
    worker = yield mediasoup.createWorker({
        logLevel: "warn",
        rtcMinPort: 10000,
        rtcMaxPort: 10100,
    });
    worker.on("died", () => {
        console.error("mediasoup server died");
        setTimeout(createMediasoupWorker, 1000);
    });
    return worker;
});
createMediasoupWorker();
const clients = new Map();
const openConversations = new Map();
const closeConversations = new Map();
wss.on("connection", function connection(socket, req) {
    console.log("websocket connected");
    const connectionUrl = new URL(req.url, `http://${req.headers.host}`);
    const clientId = connectionUrl.searchParams.get("clientId");
    if (!clientId) {
        console.error("clientId is required");
        socket.send("clientId is required");
        socket.close();
        return;
    }
    const client = clients.get(clientId);
    if (!client || !client.socket) {
        const client = new Client(clientId, socket);
        clients.set(clientId, client);
    }
    socket.on("error", (error) => {
        console.error(error);
    });
    socket.on("message", function message(data, isBinary) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const deStrucutedData = data.toString();
                const conversationData = JSON.parse(deStrucutedData);
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
                    default:
                        break;
                }
            }
            catch (error) {
                console.error("Error sending message:", error);
            }
        });
    });
    socket.on("close", function close() {
        if (clientId) {
            const client = clients.get(clientId);
            if (client) {
                openConversations.delete(clientId);
                closeConversations.delete(clientId);
                client === null || client === void 0 ? void 0 : client.socket.close();
            }
            clients.delete(clientId);
            console.log("socket connection closed");
        }
    });
});
function createConsume(messageData) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const recvTransport = transports[messageData.transportId];
            console.log(`consume reached`);
            console.log("messageData for consume: ", messageData);
            if (!router[messageData.conversationId].canConsume({
                producerId: messageData.produceId,
                rtpCapabilities: messageData.rtpCapabilities,
            })) {
                throw new Error("cannot consume");
            }
            const consume = yield recvTransport.consume({
                producerId: messageData.produceId,
                rtpCapabilities: messageData.rtpCapabilities,
            });
            console.log("consumer id:", consume.id);
            const client = clients.get(messageData.userId);
            client === null || client === void 0 ? void 0 : client.socket.send(JSON.stringify({
                messageType: "consumerCreated",
                producedUserId: messageData.producedUserId,
                producerId: messageData.produceId,
                consumerId: consume.id,
                kind: consume.kind,
                rtpParameters: consume.rtpParameters,
                conversationId: messageData.conversationId,
            }));
        }
        catch (error) {
            console.log(error);
        }
    });
}
function createProduce(messageData) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // console.log(messageData.kind);
            console.log("new produce request");
            console.log("produce requested by: ", messageData.userId);
            const sendTransport = transports[messageData.appData.transportId];
            const user = yield index_1.default.user.findUnique({
                where: {
                    id: messageData.appData.userId,
                },
            });
            if (!user) {
                throw new Error("user not found");
            }
            const conversation = yield index_1.default.conversation.findUnique({
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
            const produce = yield sendTransport.produce({
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
                client === null || client === void 0 ? void 0 : client.socket.send(JSON.stringify({
                    messageType: "createProduceResponse",
                    produceId: produce.id,
                    conversationId: conversation.conversation_id,
                }));
            }
            for (const participantId of Object.keys(onGoingCall[conversation.conversation_id])) {
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
                        client === null || client === void 0 ? void 0 : client.socket.send(JSON.stringify({
                            messageType: "newProducer",
                            producers: [
                                {
                                    produceId: produce.id,
                                    kind: produce.kind,
                                    producedUserId: user.id,
                                },
                            ],
                            conversationId: conversation.conversation_id,
                        }));
                    }
                    catch (error) {
                        console.error("Error sending newProducer message: ", error);
                    }
                }
            }
        }
        catch (error) {
            console.log(error);
        }
        // store produce id and send this produce id to all the existing participants
    });
}
function sendProducers(messageData) {
    return __awaiter(this, void 0, void 0, function* () {
        const producersToSend = [];
        // console.log(`sending produce to joinedparticipants `);
        for (const [participantId, producer] of Object.entries(onGoingCall[messageData.conversationId])) {
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
            console.log("all joined participants: ", onGoingCall[messageData.conversationId]);
            console.log("producers to consume: ", producersToSend);
            if (producersToSend.length > 0) {
                const client = clients.get(messageData.userId);
                client === null || client === void 0 ? void 0 : client.socket.send(JSON.stringify({
                    messageType: "producersToConsume",
                    conversationId: messageData.conversationId,
                    producers: producersToSend,
                }));
            }
        }
    });
}
function connectTransport(messageData) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(`connect transport reached `);
        console.log(`connect ${messageData.direction}Tranport`);
        console.log("dtls parameters", messageData.dtlsParameters);
        const transportId = messageData.transportId;
        const dtlsParameters = messageData.dtlsParameters;
        const transport = transports[transportId];
        try {
            // console.log("dtls parameters to connect: ", dtlsParameters);
            yield transport.connect({ dtlsParameters });
            const status = yield transport.getStats();
            status.forEach((stat) => {
                // console.log("Transport stats:", stat);
                console.log("requested transports connection State:", stat.dtlsState); // `new`, `connecting`, `connected`, `failed`, or `closed`
            });
            for (const [transportID, transportt] of Object.entries(transports)) {
                const stats = yield transportt.getStats();
                stats.forEach((stat) => {
                    // console.log("Transport stats:", stat);
                    console.log("DTLS State:", stat.dtlsState); // `new`, `connecting`, `connected`, `failed`, or `closed`
                });
            }
            const client = clients.get(messageData.userId);
            if (client) {
                console.log(`sending ${messageData.direction}TransportConnectResponse`);
                client.socket.send(JSON.stringify({
                    messageType: `${messageData.direction}TransportConnectResponse`,
                    transportId: transportId,
                }));
            }
        }
        catch (error) {
            console.error("Transport connect error:", error);
            const client = clients.get(messageData.userId);
            if (client) {
                client.socket.send(JSON.stringify({
                    messageType: "connectTransportError",
                    transportId,
                    error: error.message,
                }));
            }
        }
        // send all producers of the conversation except this users produceid's to the user to consume
        // send producers only if the connect transport type is receive
        // make ongoing call to store only participants id's and seperately store
    });
}
function createRouter(callType) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield worker.createRouter({
            mediaCodecs: callType === "audio"
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
    });
}
function callInitiated(messageData) {
    return __awaiter(this, void 0, void 0, function* () {
        // need conversationId to send notification to all other participants
        // need my number using which i will send rtpcapabilities
        try {
            const conversationId = messageData.conversationId;
            router[conversationId] = yield createRouter(messageData.callType);
            console.log("callinitiated by: ", conversationId);
            const conversationUsers = yield index_1.default.conversation.findUnique({
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
            const initiatorData = conversationUsers.conversationParticipants.find((participant) => {
                return participant.participantNumber === messageData.myNumber;
            });
            if (!initiatorData) {
                throw new Error("initiator data not found");
            }
            const remainingConversationParticipantsIds = conversationUsers.conversationParticipants
                .filter((participant) => participant.user.id !== (initiatorData === null || initiatorData === void 0 ? void 0 : initiatorData.user.id))
                .map((participant) => participant.user.id);
            if (!onGoingCall[conversationId]) {
                onGoingCall[conversationId] = {};
            }
            console.log("rtpCapabilities: ", router[conversationId].rtpCapabilities);
            if (clients.has(initiatorData === null || initiatorData === void 0 ? void 0 : initiatorData.user.id)) {
                const client = clients.get(initiatorData.user.id);
                client === null || client === void 0 ? void 0 : client.socket.send(JSON.stringify({
                    messageType: "routerCapabilities",
                    sendTransportFirst: true,
                    rtpCapabilities: router[conversationId].rtpCapabilities,
                    conversationId: conversationId,
                }));
            }
            remainingConversationParticipantsIds.map((participantId) => {
                if (clients.has(participantId)) {
                    const client = clients.get(participantId);
                    client === null || client === void 0 ? void 0 : client.socket.send(JSON.stringify({
                        messageType: "incomingCall",
                        callType: messageData.callType,
                        conversationId: messageData.conversationId,
                    }));
                }
            });
        }
        catch (error) {
            console.error("Error: ", error);
        }
    });
}
function sendRtpCapabilities(messageData) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const callRouter = router[messageData.conversationId];
            const user = yield index_1.default.user.findUnique({
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
                throw new Error("router not found");
            }
            // console.log("onGoingCall participants before", onGoingCall);
            onGoingCall[messageData.conversationId][user.id] = {};
            // console.log("onGoingCall participants after", onGoingCall);
            // console.log("rtp capabilities", cal)
            console.log("rtpCapabilities: ", router[messageData.conversationId].rtpCapabilities);
            if (clients.has(user.id)) {
                const client = clients.get(user.id);
                // console.log("sending router capabilities to: ", user.id);
                if (client && client.socket) {
                    client === null || client === void 0 ? void 0 : client.socket.send(JSON.stringify({
                        messageType: "routerCapabilities",
                        sendTransportFirst: false,
                        rtpCapabilities: callRouter.rtpCapabilities,
                        conversationId: messageData.conversationId,
                    }));
                }
                else {
                    console.log("no socket found");
                }
            }
        }
        catch (error) {
            console.log(error);
        }
    });
}
function createTransport(messageData) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            console.log(`create ${messageData.direction}transport: `, messageData.direction);
            const conversationId = messageData.conversationId;
            const user = yield index_1.default.user.findUnique({
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
            const transport = yield callRouter.createWebRtcTransport({
                listenIps: [{ ip: "127.0.0.1" }],
                enableUdp: true,
                enableTcp: true,
                preferUdp: true,
            });
            const transportId = transport.id;
            transports[transportId] = transport;
            console.log("ice candidates: ", transport.iceCandidates);
            if (clients.has(user.id)) {
                const client = clients.get(user.id);
                console.log(`sending ${messageData.direction}Transport creation info to the client`);
                client === null || client === void 0 ? void 0 : client.socket.send(JSON.stringify({
                    messageType: messageData.direction === "send"
                        ? "sendTransport"
                        : "receiveTransport",
                    transportDirection: messageData.direction,
                    transportId: transport.id,
                    iceCandidates: transport.iceCandidates,
                    iceParameters: transport.iceParameters,
                    dtlsParameters: transport.dtlsParameters,
                    conversationId: conversationId,
                }));
            }
        }
        catch (error) {
            console.log("error:", error);
        }
    });
}
function iceCandidate(conversationData) {
    return __awaiter(this, void 0, void 0, function* () {
        const participantNumber = conversationData.messageData.participantNumber;
        try {
            const userId = yield index_1.default.user.findUnique({
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
                client === null || client === void 0 ? void 0 : client.socket.send(JSON.stringify({
                    messageType: conversationData.messageType,
                    iceCandidateSentBy: conversationData.messageData.myNumber,
                    candidate: conversationData.messageData.candidate,
                }));
            }
        }
        catch (error) { }
    });
}
function peerConnectionOffer(conversationData) {
    return __awaiter(this, void 0, void 0, function* () {
        const participantNumber = conversationData.messageData.participantNumber;
        const conversationId = conversationData.messageData.conversationId;
        const offer = conversationData.messageData.offer;
        try {
            if (!participantNumber) {
                throw new Error("peer data is required");
            }
            const conversation = yield index_1.default.conversation.findUnique({
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
            const participantId = yield index_1.default.user.findUnique({
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
            }
            else {
                const client = clients.get(participantId.id);
                client === null || client === void 0 ? void 0 : client.socket.send(JSON.stringify({
                    messageType: conversationData.messageType,
                    peerConnectionType: conversationData.messageData.peerConnectionType,
                    offer: offer,
                    offerMadeBy: conversationData.messageData.offerMadeBy,
                    conversationId: conversationData.messageData.conversationId,
                }));
            }
        }
        catch (error) {
            console.error("Error sending message:", error);
        }
    });
}
function peerConnectionAnswer(conversationData) {
    return __awaiter(this, void 0, void 0, function* () {
        const participant = yield index_1.default.user.findUnique({
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
            client === null || client === void 0 ? void 0 : client.socket.send(JSON.stringify({
                messageType: conversationData.messageType,
                conversationId: conversationData.messageData.conversationId,
                answerMadeBy: conversationData.messageData.answerMadeBy,
                peerConnectionType: conversationData.messageData.peerConnectionType,
                answer: conversationData.messageData.answer,
            }));
        }
        else {
            throw new Error("client is not online");
        }
    });
}
function handleOpenConversation(_a) {
    return __awaiter(this, arguments, void 0, function* ({ userId, conversationId, }) {
        var _b, _c;
        if (!openConversations.has(userId)) {
            openConversations.set(userId, new Set());
        }
        if (closeConversations.has(userId)) {
            (_b = closeConversations.get(userId)) === null || _b === void 0 ? void 0 : _b.delete(conversationId);
        }
        if (conversationId) {
            (_c = openConversations.get(userId)) === null || _c === void 0 ? void 0 : _c.add(conversationId);
            yield index_1.default.readStatus.updateMany({
                where: {
                    userId: userId,
                    conversationId: conversationId,
                },
                data: {
                    isRead: true,
                },
            });
        }
    });
}
function handleCloseConversation({ userId, conversationId, }) {
    var _a, _b;
    if (!closeConversations.has(userId)) {
        closeConversations.set(userId, new Set());
    }
    if (openConversations.has(userId)) {
        (_a = openConversations.get(userId)) === null || _a === void 0 ? void 0 : _a.delete(conversationId);
    }
    if (conversationId) {
        (_b = closeConversations.get(userId)) === null || _b === void 0 ? void 0 : _b.add(conversationId);
    }
}
function sendMessage(conversationData, isBinary) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (conversationData.messageContent === "") {
                throw new Error("content cannot be empty");
            }
            const messageData = yield index_1.default.message.create({
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
            yield index_1.default.conversation.update({
                where: {
                    conversation_id: conversationData.conversationId,
                },
                data: {
                    DateModified: new Date(),
                },
            });
            const participants = messageData.conversation.conversationParticipants;
            const readStatusData = participants
                .filter((participant) => participant.user.id !== conversationData.senderId)
                .map((participant) => ({
                userId: participant.user.id,
                messageId: messageData.message_id,
                conversationId: messageData.conversationId,
                isRead: false,
            }));
            yield index_1.default.readStatus.createMany({
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
                var _a;
                const client = clients.get(user.id);
                if (client) {
                    console.log("sending message");
                    if (((_a = openConversations
                        .get(user.id)) === null || _a === void 0 ? void 0 : _a.has(conversationData.conversationId)) ||
                        !closeConversations) {
                        client.socket.send(JSON.stringify({
                            messageType: "newMessage",
                            conversationId: conversationData.conversationId,
                            outgoingMessage,
                        }));
                    }
                    else {
                        client.socket.send(JSON.stringify({
                            messageType: "unreadMessage",
                            conversationId: conversationData.conversationId,
                        }));
                    }
                }
            });
        }
        catch (error) {
            console.error(`Error sending message to user`, error);
        }
    });
}
