import type { Match, MatchResult, Mode } from "./game";
import { teamById } from "./teams";

/** Shapes stored in Postgres (team ids instead of full team objects). */
export type StoredMatch = { mode: Mode; teams: string[] };
export type StoredResult =
  | { mode: "cashout"; order: string[]; cash: number[] }
  | { mode: "final"; order: string[]; score: [number, number] };

export type Account = { id: string; username: string };

export type MemberPick = { round: number; team_id: string; survived: boolean | null };

export type Member = {
  id: string;
  username: string;
  out_round: number | null;
  rebuy_used: boolean;
  winner: boolean;
  /** Has a pick for the current round (the team stays hidden until the reveal). */
  picked: boolean;
  picks: MemberPick[];
};

export type LeagueStatus = "lobby" | "playing" | "finished";

export type FriendLeagueState = {
  league: {
    id: string;
    name: string;
    status: LeagueStatus;
    round: number;
    ending: "solo" | "split" | "wipeout" | null;
    invite_code: string;
    is_owner: boolean;
    owner_id: string;
  };
  me: string;
  members: Member[];
  current: { round: number; matches: StoredMatch[]; results: StoredResult[] | null } | null;
};

export type LeagueSummary = {
  id: string;
  name: string;
  status: LeagueStatus;
  round: number;
  ending: FriendLeagueState["league"]["ending"];
  is_owner: boolean;
  out_round: number | null;
  winner: boolean;
  members: number;
  alive: number;
};

export const storeMatches = (matches: Match[]): StoredMatch[] =>
  matches.map((m) => ({ mode: m.mode, teams: m.teams.map((t) => t.id) }));

export const storeResults = (results: MatchResult[]): StoredResult[] =>
  results.map((r) =>
    r.mode === "cashout"
      ? { mode: "cashout", order: r.order.map((t) => t.id), cash: r.cash }
      : { mode: "final", order: r.order.map((t) => t.id), score: r.score },
  );

export const loadMatches = (matches: StoredMatch[]): Match[] =>
  matches.map((m) => ({ mode: m.mode, teams: m.teams.map((id) => teamById[id]) }));

export const loadResults = (results: StoredResult[]): MatchResult[] =>
  results.map((r) =>
    r.mode === "cashout"
      ? { mode: "cashout", order: r.order.map((id) => teamById[id]), cash: r.cash }
      : { mode: "final", order: r.order.map((id) => teamById[id]), score: r.score },
  );
