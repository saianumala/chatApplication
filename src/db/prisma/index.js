"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
function prismaClientSingleton() {
    return new client_1.PrismaClient();
}
const prisma = (_a = globalThis.globalPrismaClient) !== null && _a !== void 0 ? _a : prismaClientSingleton();
if (process.env.NODE_ENV !== "production")
    globalThis.globalPrismaClient = prisma;
exports.default = prisma;
