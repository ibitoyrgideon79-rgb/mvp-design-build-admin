// Uses the Web Crypto API (globalThis.crypto.subtle) rather than Node's
// `crypto` module - this file is imported by middleware.js, which runs on
// the Edge runtime and doesn't have Node's crypto module available. Web
// Crypto works in both the Edge runtime and Node, so one implementation
// covers both.

export const SESSION_COOKIE = "mvp_admin_session";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days

function getKey() {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error("AUTH_SECRET is not set");
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

function toHex(buffer) {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function sign(payload) {
  const key = await getKey();
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload));
  return toHex(signature);
}

function safeEqual(a, b) {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
}

export function checkCredentials(username, password) {
  const validUsername = process.env.ADMIN_USERNAME || "";
  const validPassword = process.env.ADMIN_PASSWORD || "";
  if (!validUsername || !validPassword) return false;
  return (
    safeEqual(username || "", validUsername) &&
    safeEqual(password || "", validPassword)
  );
}

export async function createSessionToken() {
  const expiresAt = Date.now() + SESSION_MAX_AGE_SECONDS * 1000;
  const payload = String(expiresAt);
  return `${payload}.${await sign(payload)}`;
}

export async function isValidSessionToken(token) {
  if (!token) return false;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return false;
  if (!safeEqual(signature, await sign(payload))) return false;
  return Number(payload) > Date.now();
}

export const SESSION_COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: SESSION_MAX_AGE_SECONDS,
};
