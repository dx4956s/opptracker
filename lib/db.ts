import mongoose from "mongoose";
import { hashPassword, verifyPassword } from "./auth";

declare global {
  // eslint-disable-next-line no-var
  var __mongooseCache: {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
  };
}

if (!global.__mongooseCache) {
  global.__mongooseCache = { conn: null, promise: null };
}

const cache = global.__mongooseCache;

export async function connectDB(): Promise<typeof mongoose> {
  if (cache.conn) return cache.conn;

  if (!cache.promise) {
    const uri = process.env.MONGODB_URI;
    if (!uri) throw new Error("MONGODB_URI is not defined");

    cache.promise = mongoose
      .connect(uri, { bufferCommands: false })
      .then(async (m) => {
        await seedAdmin();
        await seedTestUser();
        return m;
      });
  }

  cache.conn = await cache.promise;
  return cache.conn;
}

// ─── Admin seed ───────────────────────────────────────────────────────────────
// On every cold start: ensure the env-configured admin exists and its
// credentials match the env vars. If the password drifts it gets updated.

async function seedAdmin() {
  const adminUsername = process.env.ADMIN_USER;
  const adminPassword = process.env.ADMIN_PASS;
  if (!adminUsername || !adminPassword) return;

  // Lazy import to avoid circular deps (model imports db)
  const { User } = await import("./models/User");

  const existing = await User.findOne({ username: adminUsername });

  if (!existing) {
    await User.create({
      username: adminUsername,
      passwordHash: hashPassword(adminPassword),
      role: "admin",
    });
    return;
  }

  // Update password if it no longer matches env
  if (!verifyPassword(adminPassword, existing.passwordHash)) {
    existing.passwordHash = hashPassword(adminPassword);
    await existing.save();
  }
}

// ─── Test user seed ───────────────────────────────────────────────────────────
// Same logic as admin seed but for the TEST_USER / TEST_PASS env vars.
// Role is always "user". Runs on every cold start.

async function seedTestUser() {
  const testUsername = process.env.TEST_USER;
  const testPassword = process.env.TEST_PASS;
  if (!testUsername || !testPassword) return;

  const { User } = await import("./models/User");

  const existing = await User.findOne({ username: testUsername });

  if (!existing) {
    await User.create({
      username: testUsername,
      passwordHash: hashPassword(testPassword),
      role: "user",
    });
    return;
  }

  // If role was accidentally set to admin, correct it
  let dirty = false;
  if (existing.role !== "user") {
    existing.role = "user";
    dirty = true;
  }
  if (!verifyPassword(testPassword, existing.passwordHash)) {
    existing.passwordHash = hashPassword(testPassword);
    dirty = true;
  }
  if (dirty) await existing.save();
}
