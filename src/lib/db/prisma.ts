import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  try {
    const connectionString = process.env.DATABASE_URL;

    if (!connectionString) {
      throw new Error("DATABASE_URL is not configured");
    }

    const adapter = new PrismaPg({ connectionString });

    return new PrismaClient({
      adapter,
      log:
        process.env.NODE_ENV === "development"
          ? ["query", "error", "warn"]
          : ["error"],
    });
  } catch (error) {
    console.warn("PrismaClient initialization warning:", error);
    // Return a dummy proxy to prevent crash when DB is unconfigured
    return new Proxy({} as PrismaClient, {
      get(_target, prop) {
        if (typeof prop === "string" && prop.startsWith("$")) {
          return () => Promise.resolve([]);
        }
        return new Proxy(
          {},
          {
            get() {
              return () => Promise.resolve([]);
            },
          },
        );
      },
    });
  }
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
