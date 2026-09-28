import "server-only";
import { type SupabaseClient, createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_PUBLISHABLE_KEY;

export const dbConfigured = Boolean(url && key);

let client: SupabaseClient | null = null;

function db() {
  if (!url || !key) throw new GameError("db_not_configured");
  client ??= createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  return client;
}

/** A known failure raised by one of the `ls_*` database functions. */
export class GameError extends Error {}

/** Calls a `ls_*` Postgres function. All authorization happens inside the database. */
export async function rpc<T>(fn: string, args: Record<string, unknown>): Promise<T> {
  const { data, error } = await db().rpc(fn, args);
  if (error) throw new GameError(error.message);
  return data as T;
}

const messages: Record<string, string> = {
  db_not_configured: "La base de datos no está configurada (faltan SUPABASE_URL y SUPABASE_PUBLISHABLE_KEY).",
  not_authenticated: "Tu sesión ha caducado. Vuelve a entrar.",
  invalid_username:
    "El usuario debe tener entre 3 y 18 caracteres: letras, números, punto, guion o guion bajo.",
  invalid_password: "La contraseña debe tener entre 6 y 72 caracteres.",
  username_taken: "Ese nombre de usuario ya existe.",
  invalid_credentials: "Usuario o contraseña incorrectos.",
  invalid_name: "El nombre de la liga debe tener entre 2 y 32 caracteres.",
  too_many_leagues: "Tienes demasiadas ligas activas (máximo 10).",
  league_not_found: "No existe ninguna liga con ese código.",
  league_started: "Esa liga ya ha empezado.",
  league_full: "La liga está completa (24 jugadores).",
  not_member: "No formas parte de esta liga.",
  not_owner: "Solo quien creó la liga puede hacer esto.",
  not_enough_players: "Hacen falta al menos 2 jugadores para empezar.",
  league_not_playing: "La liga no está en juego.",
  round_closed: "Esta ronda ya se ha jugado.",
  round_open: "La ronda todavía no se ha jugado.",
  no_more_rounds: "No quedan más rondas.",
  eliminated: "Estás eliminado.",
  invalid_team: "Ese equipo no juega esta ronda.",
  team_used: "Ya usaste ese equipo en esta liga.",
  rebuy_unavailable: "El reenganche no está disponible ahora.",
  invalid_results: "Los resultados no son válidos.",
  invalid_matches: "Las partidas no son válidas.",
};

export function messageFor(error: unknown) {
  if (error instanceof GameError) {
    const code = Object.keys(messages).find((k) => error.message.includes(k));
    if (code) return messages[code];
  }
  console.error(error);
  return "Algo ha fallado. Inténtalo de nuevo.";
}
