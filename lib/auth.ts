import { pbkdf2Sync, randomBytes } from "crypto";
import { SignJWT, jwtVerify } from "jose";

// ─── Password ─────────────────────────────────────────────────────────────────

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = pbkdf2Sync(password, salt, 100_000, 64, "sha512").toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const check = pbkdf2Sync(password, salt, 100_000, 64, "sha512").toString("hex");
  return check === hash;
}

// ─── JWT ──────────────────────────────────────────────────────────────────────

function getSecret() {
  const raw = process.env.JWT_SECRET;
  if (!raw) throw new Error("JWT_SECRET is not defined");
  return new TextEncoder().encode(raw);
}

export interface TokenPayload {
  userId: string;
  username: string;
  role: "admin" | "user";
}

export async function signToken(payload: TokenPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getSecret());
}

export async function verifyToken(token: string): Promise<TokenPayload> {
  const { payload } = await jwtVerify(token, getSecret());
  return payload as unknown as TokenPayload;
}
