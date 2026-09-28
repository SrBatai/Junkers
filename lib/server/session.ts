import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { Account } from "@/lib/friends";
import { dbConfigured, rpc } from "./db";

const COOKIE = "ls_session";
const THIRTY_DAYS = 60 * 60 * 24 * 30;

export async function getToken() {
  return (await cookies()).get(COOKIE)?.value ?? null;
}

export async function setToken(token: string) {
  (await cookies()).set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: THIRTY_DAYS,
  });
}

export async function clearToken() {
  (await cookies()).delete(COOKIE);
}

/** The signed-in account for this request, or null. */
export const getAccount = cache(async (): Promise<Account | null> => {
  if (!dbConfigured) return null;
  const token = await getToken();
  if (!token) return null;
  try {
    return await rpc<Account | null>("ls_me", { p_token: token });
  } catch {
    return null;
  }
});

/** Redirects to /entrar when nobody is signed in. */
export async function requireSession(next: string) {
  const account = await getAccount();
  const token = await getToken();
  if (!account || !token) redirect(`/entrar?next=${encodeURIComponent(next)}`);
  return { account, token };
}

/** Only allow same-site relative redirects after signing in. */
export function safeNext(next: unknown) {
  return typeof next === "string" && next.startsWith("/") && !next.startsWith("//") ? next : "/ligas";
}
