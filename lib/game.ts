import type { Team } from "./teams";
import { teams } from "./teams";

/**
 * Pure logic for the landing-page demo. Randomness is always injected so the
 * first render is deterministic (SSR and hydration match) and the reducer
 * stays pure.
 *
 * Demo format: rounds 1-5 are Cashouts (4 teams, the top 2 survive) and the
 * last round is a Final Round (head to head, only the winner survives).
 */

export const DEMO_ROUNDS = 6;
export const DEMO_RIVALS = 23;
const CASHOUT_SIZE = 4;
const CASHOUT_SURVIVORS = 2;
/** Chance that each rival still alive survives a round. */
const RIVAL_SURVIVAL = { cashout: 0.66, final: 0.55 } as const;
/** Lower = favourites win more often. */
const TEMPERATURE = 11;

export type Rand = () => number;
export type Mode = "cashout" | "final";

export function seeded(seed: number): Rand {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export type Match = { mode: Mode; teams: Team[] };

export type MatchResult =
  /** `order` is the final ranking; `cash` is aligned with it. */
  | { mode: "cashout"; order: Team[]; cash: number[] }
  /** `order[0]` won; `score` is [winner, loser] in a best of three. */
  | { mode: "final"; order: Team[]; score: [number, number] };

export type Ending = "solo" | "split" | "wipeout" | "out";

export function modeForRound(round: number): Mode {
  return round >= DEMO_ROUNDS ? "final" : "cashout";
}

function shuffle<T>(items: T[], rand: Rand) {
  const pool = [...items];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool;
}

export function makeMatches(round: number, rand: Rand): Match[] {
  const mode = modeForRound(round);
  const size = mode === "cashout" ? CASHOUT_SIZE : 2;
  const pool = shuffle(teams, rand);
  const matches: Match[] = [];
  for (let i = 0; i + size <= pool.length; i += size) {
    matches.push({ mode, teams: pool.slice(i, i + size) });
  }
  return matches;
}

const weight = (team: Team) => Math.exp(team.rating / TEMPERATURE);

/** Plackett-Luce draw: pick 1st by strength, then 2nd from the rest, and so on. */
function rank(field: Team[], rand: Rand) {
  const left = [...field];
  const order: Team[] = [];
  while (left.length) {
    const total = left.reduce((sum, t) => sum + weight(t), 0);
    let roll = rand() * total;
    let index = 0;
    for (; index < left.length - 1; index++) {
      roll -= weight(left[index]);
      if (roll <= 0) break;
    }
    order.push(left.splice(index, 1)[0]);
  }
  return order;
}

const roundTo = (value: number, step: number) => Math.round(value / step) * step;

export function playMatch(match: Match, rand: Rand): MatchResult {
  const order = rank(match.teams, rand);
  if (match.mode === "final") {
    return { mode: "final", order, score: [2, rand() < 0.5 ? 0 : 1] };
  }
  let cash = roundTo(18000 + rand() * 14000, 50);
  const amounts = order.map((_, i) => {
    if (i > 0) cash = roundTo(cash * (0.55 + rand() * 0.3), 50);
    return cash;
  });
  return { mode: "cashout", order, cash: amounts };
}

export function placementOf(teamId: string, result: MatchResult) {
  return result.order.findIndex((t) => t.id === teamId);
}

export function survives(teamId: string, result: MatchResult) {
  const place = placementOf(teamId, result);
  return result.mode === "cashout" ? place < CASHOUT_SURVIVORS : place === 0;
}

export function survivors(alive: number, mode: Mode, rand: Rand) {
  let left = 0;
  for (let i = 0; i < alive; i++) if (rand() < RIVAL_SURVIVAL[mode]) left++;
  return left;
}

/* ------------------------------------------------------------------ state */

export type GameState = {
  round: number;
  matches: Match[];
  results: MatchResult[] | null;
  used: string[];
  pick: string | null;
  phase: "pick" | "result";
  survived: boolean | null;
  rivalsBefore: number;
  rivals: number;
  rebuyUsed: boolean;
  ending: Ending | null;
};

export type GameAction =
  | { type: "select"; teamId: string }
  | { type: "resolve"; results: MatchResult[]; rivals: number }
  | { type: "next"; matches: Match[] }
  | { type: "rebuy"; matches: Match[] }
  | { type: "reset"; matches: Match[] };

export function initialGame(matches?: Match[]): GameState {
  return {
    round: 1,
    matches: matches ?? makeMatches(1, seeded(2026)),
    results: null,
    used: [],
    pick: null,
    phase: "pick",
    survived: null,
    rivalsBefore: DEMO_RIVALS,
    rivals: DEMO_RIVALS,
    rebuyUsed: false,
    ending: null,
  };
}

export function pickedMatch(state: GameState) {
  if (!state.pick) return null;
  const index = state.matches.findIndex((m) => m.teams.some((t) => t.id === state.pick));
  return index === -1 ? null : { index, match: state.matches[index] };
}

export function canRebuy(state: GameState) {
  return state.ending === "out" && !state.rebuyUsed && state.round < DEMO_ROUNDS;
}

function endingFor(state: GameState, survived: boolean, rivals: number): Ending | null {
  if (survived) {
    if (rivals === 0) return "solo";
    if (state.round >= DEMO_ROUNDS) return "split";
    return null;
  }
  return rivals === 0 ? "wipeout" : "out";
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "select": {
      if (state.phase !== "pick" || state.used.includes(action.teamId)) return state;
      return { ...state, pick: state.pick === action.teamId ? null : action.teamId };
    }
    case "resolve": {
      const picked = pickedMatch(state);
      if (state.phase !== "pick" || !picked || !state.pick) return state;
      const survived = survives(state.pick, action.results[picked.index]);
      return {
        ...state,
        phase: "result",
        results: action.results,
        used: [...state.used, state.pick],
        survived,
        rivalsBefore: state.rivals,
        rivals: action.rivals,
        ending: endingFor(state, survived, action.rivals),
      };
    }
    case "next":
    case "rebuy": {
      if (state.phase !== "result") return state;
      if (action.type === "next" && !state.survived) return state;
      if (action.type === "rebuy" && !canRebuy(state)) return state;
      if (state.ending !== null && action.type === "next") return state;
      return {
        ...state,
        round: state.round + 1,
        matches: action.matches,
        results: null,
        pick: null,
        phase: "pick",
        survived: null,
        rivalsBefore: state.rivals,
        ending: null,
        rebuyUsed: state.rebuyUsed || action.type === "rebuy",
      };
    }
    case "reset":
      return initialGame(action.matches);
  }
}
