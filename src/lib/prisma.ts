import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

// ตรวจสอบว่าเป็น server-side
const isServer = typeof window === "undefined";

export const prisma = isServer
  ? globalForPrisma.prisma ||
    new PrismaClient()
  : (() => {
      throw new Error("PrismaClient is unable to be run in the browser");
    })();

if (process.env.NODE_ENV !== "production" && isServer) globalForPrisma.prisma = prisma;

export default prisma; 