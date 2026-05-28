import mongoose from "mongoose";
import { env } from "./env";

type Cached = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

// Module-level cache keyed on globalThis so Next.js dev HMR doesn't reconnect
// on every reload. In Node scripts the global cache simply prevents duplicate
// connection attempts inside the same process.
declare global {
  // eslint-disable-next-line no-var
  var __mongoose__: Cached | undefined;
}

const cached: Cached = global.__mongoose__ ?? { conn: null, promise: null };
global.__mongoose__ = cached;

export async function connectDb(): Promise<typeof mongoose> {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    const uri = env().MONGODB_URI;
    cached.promise = mongoose
      .connect(uri, {
        // Mongoose 8 defaults are sane; keep these explicit for clarity.
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5_000,
      })
      .then((m) => {
        m.connection.on("error", (err) => {
          console.error("[mongo] connection error:", err);
        });
        return m;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (err) {
    cached.promise = null;
    throw err;
  }
  return cached.conn;
}

export async function disconnectDb() {
  if (cached.conn) {
    await cached.conn.disconnect();
    cached.conn = null;
    cached.promise = null;
  }
}
