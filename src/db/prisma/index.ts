import { PrismaClient } from "@prisma/client";
function prismaClientSingleton() {
  return new PrismaClient();
}
declare global {
  var globalPrismaClient: undefined | ReturnType<typeof prismaClientSingleton>;
}

const prisma: ReturnType<typeof prismaClientSingleton> =
  globalThis.globalPrismaClient ?? prismaClientSingleton();

if (process.env.NODE_ENV !== "production")
  globalThis.globalPrismaClient = prisma;

export default prisma;
