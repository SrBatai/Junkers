import type { LeagueId, Team } from "./teams";
import { leagues } from "./teams";

/**
 * Pure logic for the landing-page demo. Randomness is always injected so the
 * first render is deterministic (SSR and hydration match) and the reducer
 * stays pure.
 */

export const DEMO_ROUNDS = 6;
export const DEMO_RIVALS = 23;
/** Chance that each rival still alive is knocked out in a given round. */
const RIVAL_KNOCKOUT_RATE = 0.3;
const HOME_ADVANTAGE = 4;

export type Rand = () => number;

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

export type Fixture = { home: Team; away: Team };
export type Score = { home: number; away: number };
export type Outcome = "win" | "draw" | "loss";
export type Ending = "solo" | "split" | "wipeout" | "out";

export function makeFixtures(teams: Team[], rand: Rand): Fixture[] {
  const pool = [...teams];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  const fixtures: Fixture[] = [];
  for (let i = 0; i + 1 < pool.length; i += 2) {
    fixtures.push({ home: pool[i], away: pool[i + 1] });
  }
  return fixtures;
}

function goals(rand: Rand, min: number, max: number) {
  return min + Math.floor(rand() * (max - min + 1));
}

export function playMatch({ home, away }: Fixture, rand: Rand): Score {
  const diff = (home.rating + HOME_ADVANTAGE - away.rating) / 100;
  const pDraw = Math.min(0.3, Math.max(0.14, 0.27 - Math.abs(diff) * 0.5));
  const pHome = Math.min(0.8, Math.max(0.08, 0.4 + diff * 1.4));
  const roll = rand();

  if (roll < pHome) {
    const w = goals(rand, 1, 4);
    return { home: w, away: goals(rand, 0, w - 1) };
  }
  if (roll < pHome + pDraw) {
    const g = goals(rand, 0, 2);
    return { home: g, away: g };
  }
  const w = goals(rand, 1, 3);
  return { home: goals(rand, 0, w - 1), away: w };
}

export function outcomeFor(teamId: string, fixture: Fixture, score: Score): Outcome {
  if (score.home === score.away) return "draw";
  const isHome = fixture.home.id === teamId;
  const won = isHome ? score.home > score.away : score.away > score.home;
  return won ? "win" : "loss";
}

export function survivors(alive: number, rand: Rand) {
  let left = 0;
  for (let i = 0; i < alive; i++) if (rand() >= RIVAL_KNOCKOUT_RATE) left++;
  return left;
}

/* ------------------------------------------------------------------ state */

export type GameState = {
  leagueId: LeagueId;
  round: number;
  fixtures: Fixture[];
  scores: Score[] | null;
  used: string[];
  pick: string | null;
  phase: "pick" | "result";
  outcome: Outcome | null;
  rivalsBefore: number;
  rivals: number;
  rebuyUsed: boolean;
  ending: Ending | null;
};

export type GameAction =
  | { type: "select"; teamId: string }
  | { type: "resolve"; scores: Score[]; rivals: number }
  | { type: "next"; fixtures: Fixture[] }
  | { type: "rebuy"; fixtures: Fixture[] }
  | { type: "reset"; leagueId: LeagueId; fixtures: Fixture[] };

export function initialGame(leagueId: LeagueId, fixtures?: Fixture[]): GameState {
  return {
    leagueId,
    round: 1,
    fixtures: fixtures ?? makeFixtures(leagues[leagueId].teams, seeded(2026)),
    scores: null,
    used: [],
    pick: null,
    phase: "pick",
    outcome: null,
    rivalsBefore: DEMO_RIVALS,
    rivals: DEMO_RIVALS,
    rebuyUsed: false,
    ending: null,
  };
}

export function pickedFixture(state: GameState) {
  if (!state.pick) return null;
  const index = state.fixtures.findIndex((f) => f.home.id === state.pick || f.away.id === state.pick);
  return index === -1 ? null : { index, fixture: state.fixtures[index] };
}

export function canRebuy(state: GameState) {
  return state.ending === "out" && !state.rebuyUsed && state.round < DEMO_ROUNDS;
}

function endingFor(state: GameState, outcome: Outcome, rivals: number): Ending | null {
  if (outcome === "win") {
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
      const match = pickedFixture(state);
      if (state.phase !== "pick" || !match || !state.pick) return state;
      const outcome = outcomeFor(state.pick, match.fixture, action.scores[match.index]);
      return {
        ...state,
        phase: "result",
        scores: action.scores,
        used: [...state.used, state.pick],
        outcome,
        rivalsBefore: state.rivals,
        rivals: action.rivals,
        ending: endingFor(state, outcome, action.rivals),
      };
    }
    case "next":
    case "rebuy": {
      if (state.phase !== "result") return state;
      if (action.type === "next" && state.outcome !== "win") return state;
      if (action.type === "rebuy" && !canRebuy(state)) return state;
      return {
        ...state,
        round: state.round + 1,
        fixtures: action.fixtures,
        scores: null,
        pick: null,
        phase: "pick",
        outcome: null,
        rivalsBefore: state.rivals,
        ending: null,
        rebuyUsed: state.rebuyUsed || action.type === "rebuy",
      };
    }
    case "reset":
      return initialGame(action.leagueId, action.fixtures);
  }
}
