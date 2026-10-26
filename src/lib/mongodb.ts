import mongoose from "mongoose";

type Cache = { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null };

const globalForMongoose = globalThis as unknown as { _mongoose?: Cache };
const cache: Cache = globalForMongoose._mongoose ?? { conn: null, promise: null };
globalForMongoose._mongoose = cache;

// Forgives the usual copy-paste slips in the hosting dashboard: spaces,
// surrounding quotes, or the whole `MONGODB_URI=...` line pasted as the value.
export function cleanMongoUri(raw: string | undefined) {
  return (raw ?? "")
    .trim()
    .replace(/^MONGODB_URI\s*=\s*/, "")
    .replace(/^["'`]+|["'`]+$/g, "")
    .trim();
}

// Reuses one connection across hot reloads and serverless invocations.
export async function connectDB() {
  if (cache.conn) return cache.conn;
  const uri = cleanMongoUri(process.env.MONGODB_URI);
  if (!uri) throw new Error("MONGODB_URI is not set. Add it to your environment variables.");
  cache.promise ??= mongoose.connect(uri, { bufferCommands: false, serverSelectionTimeoutMS: 10000 });
  try {
    cache.conn = await cache.promise;
  } catch (err) {
    cache.promise = null;
    throw err;
  }
  return cache.conn;
}
