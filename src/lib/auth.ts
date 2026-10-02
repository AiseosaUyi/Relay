import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

/**
 * Single-owner gate. Relay is a personal tool, so there are no accounts.
 * Set OWNER_PASSWORD and log in once; the session is an httpOnly cookie
 * holding an HMAC of the password, so changing the password logs you out
 * everywhere.
 *
 * Local dev without OWNER_PASSWORD is open, so `npm run dev` just works.
 * In production a missing password locks everything instead of opening it.
 */

export const OWNER_COOKIE = "relay_owner";
const MAX_AGE = 60 * 60 * 24 * 90;

function password() {
  return process.env.OWNER_PASSWORD || "";
}

export function authConfigured() {
  return password().length > 0;
}

function token(pw: string) {
  return createHmac("sha256", pw).update("relay-owner-v1").digest("hex");
}

function safeEqual(a: string, b: string) {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  return ab.length === bb.length && timingSafeEqual(ab, bb);
}

export async function isOwner(): Promise<boolean> {
  // Read cookies first so every owner page is rendered per request, never prerendered.
  const cookie = (await cookies()).get(OWNER_COOKIE)?.value;
  if (!authConfigured()) return process.env.NODE_ENV !== "production";
  return Boolean(cookie && safeEqual(cookie, token(password())));
}

/** Use at the top of every owner-only page and server action. */
export async function requireOwner(next = "/dashboard") {
  if (!(await isOwner())) redirect(`/login?next=${encodeURIComponent(next)}`);
}

export async function checkPassword(attempt: string): Promise<boolean> {
  if (!authConfigured()) return false;
  return safeEqual(token(attempt), token(password()));
}

export async function startSession() {
  (await cookies()).set(OWNER_COOKIE, token(password()), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: MAX_AGE,
    path: "/",
  });
}

export async function endSession() {
  (await cookies()).delete(OWNER_COOKIE);
}

/** Only allow relative redirects after login. */
export function safeNext(next: string | null | undefined) {
  return next && next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard";
}
