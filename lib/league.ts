import {
  DEMO_ROUNDS as ROUNDS,
  type Match,
  type MatchResult,
  type Rand,
  makeMatches,
  modeForRound,
  playMatch,
  survives,
} from "./game";
import { type Team, teams } from "./teams";

/**
 * Full league for the /jugar page: the viewer plus bot players who pick real
 * teams every round and fall on real (simulated) results. Pure functions:
 * randomness is always injected.
 */

export { ROUNDS };
export const RIVAL_OPTIONS = [7, 15, 23] as const;
export const LEAGUE_VERSION = 1;

const BOT_NAMES = [
  "Kaizen",
  "LaCabra",
  "VaultRunner",
  "Nopick",
  "Mireya",
  "Tuercas",
  "Ruizinho",
  "CashQueen",
  "pepe.exe",
  "Dracarys",
  "Laurita",
  "Zeta",
  "Boliche",
  "Goma2",
  "Neblina",
  "Txus",
  "Marimar",
  "Coyote",
  "Blazer",
  "Kiwi",
  "Pólvora",
  "Sombra",
  "Chispas",
  "Vándalo",
  "Lince",
  "Maite",
  "Oso",
  "Ronin",
  "Arenas",
  "Tormenta",
];

export type Pick = { teamId: string; survived: boolean };

export type Player = {
  id: string;
  name: string;
  you: boolean;
  /** Round in which the player fell, or null while alive. */
  out: number | null;
  used: string[];
  picks: Record<number, Pick>;
};

export type Ending = "solo" | "split" | "wipeout";

export type League = {
  version: typeof LEAGUE_VERSION;
  name: string;
  round: number;
  phase: "pick" | "result";
  matches: Match[];
  results: MatchResult[] | null;
  players: Player[];
  /** The viewer's pick for the current round. */
  pick: string | null;
  rebuyAvailable: boolean;
  ending: Ending | null;
  winners: string[];
  points: number | null;
};

export type Profile = { points: number; leagues: number; wins: number };

export const emptyProfile: Profile = { points: 0, leagues: 0, wins: 0 };

function shuffle<T>(items: T[], rand: Rand) {
  const pool = [...items];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool;
}

export function createLeague(name: string, you: string, rivals: number, rand: Rand): League {
  const names = shuffle(
    BOT_NAMES.filter((n) => n.toLowerCase() !== you.toLowerCase()),
    rand,
  ).slice(0, rivals);
  const players: Player[] = [
    { id: "you", name: you, you: true, out: null, used: [], picks: {} },
    ...names.map((n, i) => ({ id: `bot-${i}`, name: n, you: false, out: null, used: [], picks: {} })),
  ];
  return {
    version: LEAGUE_VERSION,
    name,
    round: 1,
    phase: "pick",
    matches: makeMatches(1, rand),
    results: null,
    players,
    pick: null,
    rebuyAvailable: true,
    ending: null,
    winners: [],
    points: null,
  };
}

export const youOf = (league: League) => league.players.find((p) => p.you)!;
export const alivePlayers = (league: League) => league.players.filter((p) => p.out === null);

function matchIndexOf(matches: Match[], teamId: string) {
  return matches.findIndex((m) => m.teams.some((t) => t.id === teamId));
}

/**
 * Bots weigh a team's strength against its opponents this round, add noise, and
 * tend to save the very best teams for the Final Round.
 */
export function botPick(player: Player, matches: Match[], round: number, rand: Rand) {
  const final = modeForRound(round) === "final";
  let best: { team: Team; score: number } | null = null;
  for (const team of teams) {
    if (player.used.includes(team.id)) continue;
    const match = matches[matchIndexOf(matches, team.id)];
    const opponents = match.teams.filter((t) => t.id !== team.id);
    const rivalStrength = opponents.reduce((sum, t) => sum + t.rating, 0) / opponents.length;
    const saveForLater = !final && team.rating >= 87 ? 6 + rand() * 8 : 0;
    const score = team.rating - 0.6 * rivalStrength + (rand() * 2 - 1) * 14 - saveForLater;
    if (!best || score > best.score) best = { team, score };
  }
  return best!.team.id;
}

export function selectTeam(league: League, teamId: string): League {
  const you = youOf(league);
  if (league.phase !== "pick" || you.out !== null || you.used.includes(teamId)) return league;
  return { ...league, pick: league.pick === teamId ? null : teamId };
}

function pointsFor(league: League, you: Player) {
  const survived = Object.values(you.picks).filter((p) => p.survived).length;
  const won = league.winners.includes(you.id);
  const bonus = won ? (league.ending === "solo" ? 150 : 60) : 0;
  return 10 + survived * 15 + bonus;
}

/** Play the current round for everyone still alive. */
export function resolveRound(league: League, rand: Rand): League {
  if (league.phase !== "pick" || league.ending) return league;
  const youAlive = youOf(league).out === null;
  if (youAlive && !league.pick) return league;

  const results = league.matches.map((m) => playMatch(m, rand));
  const players = league.players.map((p) => {
    if (p.out !== null) return p;
    const teamId = p.you ? league.pick! : botPick(p, league.matches, league.round, rand);
    const survived = survives(teamId, results[matchIndexOf(league.matches, teamId)]);
    return {
      ...p,
      out: survived ? null : league.round,
      used: [...p.used, teamId],
      picks: { ...p.picks, [league.round]: { teamId, survived } },
    };
  });

  const alive = players.filter((p) => p.out === null);
  const aliveBefore = league.players.filter((p) => p.out === null);
  let ending: Ending | null = null;
  let winners: string[] = [];
  if (alive.length === 0) {
    ending = "wipeout";
  } else if (alive.length === 1 && aliveBefore.length > 1) {
    ending = "solo";
    winners = [alive[0].id];
  } else if (league.round >= ROUNDS) {
    ending = alive.length === 1 ? "solo" : "split";
    winners = alive.map((p) => p.id);
  }

  const next: League = { ...league, phase: "result", results, players, ending, winners };
  return ending ? { ...next, points: pointsFor(next, youOf(next)) } : next;
}

export function nextRound(league: League, rand: Rand): League {
  if (league.phase !== "result" || league.ending) return league;
  const round = league.round + 1;
  return { ...league, round, phase: "pick", matches: makeMatches(round, rand), results: null, pick: null };
}

/** Premium "reenganche": back in right after falling, once per league. */
export function canRebuy(league: League) {
  const you = youOf(league);
  return (
    league.phase === "result" &&
    !league.ending &&
    league.rebuyAvailable &&
    you.out === league.round &&
    league.round < ROUNDS
  );
}

export function rebuy(league: League): League {
  if (!canRebuy(league)) return league;
  return {
    ...league,
    rebuyAvailable: false,
    players: league.players.map((p) => (p.you ? { ...p, out: null } : p)),
  };
}

/** Once the viewer is out, play the remaining rounds straight through. */
export function simulateToEnd(league: League, rand: Rand): League {
  let current = league;
  for (let guard = 0; guard < ROUNDS * 2 && !current.ending; guard++) {
    current = current.phase === "result" ? nextRound(current, rand) : resolveRound(current, rand);
  }
  return current;
}

/** Players per team this round, for the "backers" badge after the reveal. */
export function backersOf(league: League) {
  const counts: Record<string, number> = {};
  if (league.phase !== "result") return counts;
  for (const p of league.players) {
    const pick = p.picks[league.round];
    if (pick) counts[pick.teamId] = (counts[pick.teamId] ?? 0) + 1;
  }
  return counts;
}

export function isLeague(value: unknown): value is League {
  return (
    typeof value === "object" &&
    value !== null &&
    (value as League).version === LEAGUE_VERSION &&
    Array.isArray((value as League).players) &&
    Array.isArray((value as League).matches)
  );
}
