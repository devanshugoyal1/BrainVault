// lib/mongodb.ts
// WHY singleton pattern?
// Next.js runs API routes in a serverless-style environment.
// Without this, every API call would open a NEW database connection,
// quickly exhausting MongoDB's connection limit (500 on free tier).
// The singleton stores one connection and reuses it across all requests.

import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
  throw new Error("Please define MONGODB_URI in .env.local");
}

// Global cache — survives hot reloads in development
declare global {
  var _mongooseCache: {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
  };
}

let cached = global._mongooseCache;

if (!cached) {
  cached = global._mongooseCache = { conn: null, promise: null };
}

export async function connectDB() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
  bufferCommands: false,
  serverSelectionTimeoutMS: 10000,
  family: 4, // Force IPv4 — fixes Windows DNS SRV issues
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}