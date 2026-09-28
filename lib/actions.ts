"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { type FriendLeagueState, loadMatches, storeMatches, storeResults } from "@/lib/friends";
import { makeMatches, playMatch } from "@/lib/game";
import { messageFor, rpc } from "@/lib/server/db";
import { clearToken, getToken, safeNext, setToken } from "@/lib/server/session";

export type FormState = { error: string | null };

const field = (form: FormData, name: string) => String(form.get(name) ?? "").trim();

/* ------------------------------------------------------------------ accounts */

async function authenticate(fn: "ls_sign_up" | "ls_sign_in", form: FormData): Promise<FormState> {
  const username = field(form, "username");
  const password = String(form.get("password") ?? "");
  if (!username || !password) return { error: "Escribe tu usuario y tu contraseña." };
  try {
    const { token } = await rpc<{ token: string }>(fn, { p_username: username, p_password: password });
    await setToken(token);
  } catch (error) {
    return { error: messageFor(error) };
  }
  redirect(safeNext(form.get("next")));
}

export async function signUp(_: FormState, form: FormData) {
  if (String(form.get("password")) !== String(form.get("confirm"))) {
    return { error: "Las contraseñas no coinciden." };
  }
  return authenticate("ls_sign_up", form);
}

export async function signIn(_: FormState, form: FormData) {
  return authenticate("ls_sign_in", form);
}

export async function signOut() {
  const token = await getToken();
  if (token) await rpc("ls_sign_out", { p_token: token }).catch(() => undefined);
  await clearToken();
  redirect("/");
}

/* ------------------------------------------------------------------ leagues */

async function token() {
  const value = await getToken();
  if (!value) redirect("/entrar?next=/ligas");
  return value;
}

export async function createLeague(_: FormState, form: FormData): Promise<FormState> {
  let id: string;
  try {
    id = await rpc<string>("ls_create_league", { p_token: await token(), p_name: field(form, "name") });
  } catch (error) {
    return { error: messageFor(error) };
  }
  redirect(`/ligas/${id}`);
}

export async function joinLeague(_: FormState, form: FormData): Promise<FormState> {
  const code = field(form, "code").toUpperCase();
  if (!/^[A-Z0-9]{6}$/.test(code)) return { error: "El código tiene 6 caracteres." };
  let id: string;
  try {
    id = await rpc<string>("ls_join_league", { p_token: await token(), p_code: code });
  } catch (error) {
    return { error: messageFor(error) };
  }
  redirect(`/ligas/${id}`);
}

type Result = { error: string | null };

async function run(leagueId: string, work: (token: string) => Promise<unknown>): Promise<Result> {
  try {
    await work(await token());
  } catch (error) {
    return { error: messageFor(error) };
  }
  revalidatePath(`/ligas/${leagueId}`);
  return { error: null };
}

export async function submitPick(leagueId: string, teamId: string) {
  return run(leagueId, (t) => rpc("ls_submit_pick", { p_token: t, p_league: leagueId, p_team: teamId }));
}

export async function startLeague(leagueId: string) {
  return run(leagueId, (t) =>
    rpc("ls_start_league", {
      p_token: t,
      p_league: leagueId,
      p_matches: storeMatches(makeMatches(1, Math.random)),
    }),
  );
}

/** Results are simulated here, on the server, then validated and applied by the database. */
export async function resolveRound(leagueId: string) {
  return run(leagueId, async (t) => {
    const state = await rpc<FriendLeagueState>("ls_league_state", { p_token: t, p_league: leagueId });
    if (!state.current) throw new Error("no current round");
    const results = loadMatches(state.current.matches).map((m) => playMatch(m, Math.random));
    await rpc("ls_resolve_round", { p_token: t, p_league: leagueId, p_results: storeResults(results) });
  });
}

export async function nextRound(leagueId: string, round: number) {
  return run(leagueId, (t) =>
    rpc("ls_next_round", {
      p_token: t,
      p_league: leagueId,
      p_matches: storeMatches(makeMatches(round + 1, Math.random)),
    }),
  );
}

export async function applyRebuy(leagueId: string) {
  return run(leagueId, (t) => rpc("ls_use_rebuy", { p_token: t, p_league: leagueId }));
}

export async function leaveLeague(leagueId: string) {
  const result = await run(leagueId, (t) => rpc("ls_leave_league", { p_token: t, p_league: leagueId }));
  if (result.error) return result;
  redirect("/ligas");
}
