"use client";

import { Fragment, useEffect, useReducer, useRef } from "react";
import {
  AnimatePresence,
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "motion/react";
import {
  ArrowClockwiseIcon,
  ArrowCounterClockwiseIcon,
  ArrowRightIcon,
  CrosshairIcon,
  LockSimpleIcon,
} from "@phosphor-icons/react";
import { buttonClass } from "@/components/ui/button";
import { Crest } from "@/components/ui/crest";
import { formatCash, modeLabel } from "@/lib/format";
import {
  DEMO_ROUNDS,
  type GameState,
  type Match,
  type MatchResult,
  canRebuy,
  gameReducer,
  initialGame,
  makeMatches,
  modeForRound,
  pickedMatch,
  placementOf,
  playMatch,
  survivors,
} from "@/lib/game";
import { type Team, teamById } from "@/lib/teams";

const ease = [0.16, 1, 0.3, 1] as const;
const letters = "ABCDEFGH";

function Counter({ value }: { value: number }) {
  const reduce = useReducedMotion();
  const mv = useMotionValue(value);
  const rounded = useTransform(mv, (v) => Math.round(v));
  useEffect(() => {
    if (reduce) {
      mv.set(value);
      return;
    }
    const controls = animate(mv, value, { duration: 0.9, ease });
    return () => controls.stop();
  }, [mv, value, reduce]);
  return <motion.span>{rounded}</motion.span>;
}

function Stat({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col">
      <dt className="text-xs text-mute">{label}</dt>
      <dd className="font-mono text-2xl font-semibold text-chalk tabular-nums">{children}</dd>
    </div>
  );
}

function RoundTrack({ round }: { round: number }) {
  return (
    <div>
      <ol className="flex gap-1.5" aria-label={`Ronda ${round} de ${DEMO_ROUNDS}`}>
        {Array.from({ length: DEMO_ROUNDS }, (_, i) => i + 1).map((r) => (
          <li
            key={r}
            className={`h-2.5 w-8 [--cut:3px] chamfer sm:w-10 ${
              r < round ? "bg-chalk/70" : r === round ? "bg-pink" : "bg-ink-4"
            }`}
          />
        ))}
      </ol>
      <p className="mt-3 text-sm text-mute">
        <span className="font-semibold text-chalk">
          Ronda {round}: {modeLabel[modeForRound(round)]}.
        </span>{" "}
        {modeForRound(round) === "cashout"
          ? "Cuatro equipos por partida, pasan los dos primeros."
          : "Cara a cara: solo vale ganar."}
      </p>
    </div>
  );
}

type RowProps = {
  team: Team;
  others: Team[];
  mode: Match["mode"];
  state: GameState;
  place: number | null;
  value: string | null;
  onSelect: (id: string) => void;
};

function TeamRow({ team, others, mode, state, place, value, onSelect }: RowProps) {
  const selected = state.pick === team.id;
  const usedBefore = state.used.includes(team.id) && !(selected && state.phase === "result");
  const locked = state.phase === "result" || usedBefore;
  const out = place !== null && (mode === "cashout" ? place > 1 : place > 0);

  return (
    <motion.li layout transition={{ duration: 0.5, ease }}>
      <button
        type="button"
        disabled={locked}
        aria-pressed={selected}
        aria-label={
          usedBefore
            ? `${team.name}, ya usado`
            : `Elegir ${team.name} (${modeLabel[mode]} contra ${others.map((o) => o.name).join(", ")})`
        }
        onClick={() => onSelect(team.id)}
        className={`flex w-full items-center gap-3 px-2.5 py-2 text-left transition-colors duration-200 [--cut:8px] chamfer ${
          selected
            ? "bg-pink text-ink"
            : usedBefore
              ? "cursor-not-allowed text-dim"
              : state.phase === "pick"
                ? "text-chalk hover:bg-white/[0.07]"
                : out
                  ? "text-mute"
                  : "text-chalk"
        }`}
      >
        {place !== null && mode === "cashout" && (
          <span className={`w-5 font-mono text-xs ${selected ? "text-ink/70" : "text-dim"}`}>
            {place + 1}º
          </span>
        )}
        <Crest team={team} size="sm" className={usedBefore ? "opacity-40" : ""} />
        <span
          className={`min-w-0 flex-1 truncate text-[15px] font-semibold ${usedBefore ? "line-through" : ""}`}
        >
          {team.name}
        </span>
        {usedBefore && <LockSimpleIcon weight="bold" className="size-4 shrink-0" aria-hidden />}
        {value !== null && (
          <motion.span
            className="font-mono text-sm font-semibold tabular-nums"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35, duration: 0.3 }}
          >
            {value}
          </motion.span>
        )}
      </button>
    </motion.li>
  );
}

function MatchCard({
  match,
  result,
  index,
  state,
  onSelect,
}: {
  match: Match;
  result: MatchResult | null;
  index: number;
  state: GameState;
  onSelect: (id: string) => void;
}) {
  const mine = match.teams.some((t) => t.id === state.pick);
  const rows = result ? result.order : match.teams;

  return (
    <li
      className={`p-1.5 transition-colors [--cut:12px] chamfer ${mine && state.phase === "result" ? "bg-ink-4" : "bg-ink-3"}`}
    >
      <p className="px-2.5 pt-1.5 pb-1 font-mono text-[11px] text-dim">
        {modeLabel[match.mode]} {letters[index]}
      </p>
      <ul>
        {rows.map((team, i) => {
          const value = result
            ? result.mode === "cashout"
              ? formatCash(result.cash[i])
              : String(i === 0 ? result.score[0] : result.score[1])
            : null;
          return (
            <Fragment key={team.id}>
              <TeamRow
                team={team}
                others={match.teams.filter((t) => t.id !== team.id)}
                mode={match.mode}
                state={state}
                place={result ? i : null}
                value={value}
                onSelect={onSelect}
              />
              {result?.mode === "cashout" && i === 1 && (
                <motion.li
                  aria-hidden
                  className="mx-2.5 my-1 border-t border-dashed border-pink/60"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                />
              )}
            </Fragment>
          );
        })}
      </ul>
    </li>
  );
}

function describe(state: GameState) {
  const picked = pickedMatch(state);
  if (!picked || !state.results || !state.pick) return null;
  const result = state.results[picked.index];
  const team = teamById[state.pick];
  const place = placementOf(team.id, result);

  let line: string;
  if (result.mode === "cashout") {
    line = `${team.name} acaba ${place + 1}º de 4 con ${formatCash(result.cash[place])}.`;
  } else {
    const rival = result.order.find((t) => t.id !== team.id)!;
    const [w, l] = result.score;
    line =
      place === 0
        ? `${team.name} gana ${w}-${l} a ${rival.name}.`
        : `${team.name} cae ${l}-${w} ante ${rival.name}.`;
  }

  const rivals = state.rivals;
  const left = rivals === 1 ? "Queda 1 rival en pie." : `Quedan ${rivals} rivales en pie.`;
  const fellToo =
    state.rivalsBefore === 1
      ? "Tu último rival también ha caído"
      : `Tus ${state.rivalsBefore} rivales también han caído`;

  switch (state.ending) {
    case "solo":
      return {
        stamp: "Único ganador",
        win: true,
        text: `${line} Todos tus rivales han caído: te llevas el bote entero.`,
      };
    case "split":
      return {
        stamp: "Reparto del bote",
        win: true,
        text: `${line} Llegas vivo al final junto a ${rivals} ${rivals === 1 ? "rival" : "rivales"}. El bote se reparte entre ${rivals + 1}.`,
      };
    case "wipeout":
      return { stamp: "Todos eliminados", win: false, text: `${line} ${fellToo}. Nadie se lleva el bote.` };
    case "out":
      return {
        stamp: "Eliminado",
        win: false,
        text: `${line} ${result.mode === "cashout" ? "Solo pasan los dos primeros. " : ""}${left}`,
      };
    default:
      return { stamp: "Sobrevives", win: true, text: `${line} Sigues vivo. ${left}` };
  }
}

export function RoundSimulator() {
  const [state, dispatch] = useReducer(gameReducer, undefined, () => initialGame());
  const reduce = useReducedMotion();
  const panelRef = useRef<HTMLDivElement>(null);
  const picked = pickedMatch(state);
  const pickTeam = state.pick ? teamById[state.pick] : null;
  const opponents = picked && pickTeam ? picked.match.teams.filter((t) => t.id !== pickTeam.id) : [];
  const copy = state.phase === "result" ? describe(state) : null;
  const alive = state.rivals + (state.phase === "result" && !state.survived ? 0 : 1);
  const mode = modeForRound(state.round);

  const select = (id: string) => dispatch({ type: "select", teamId: id });

  const confirm = () => {
    dispatch({
      type: "resolve",
      results: state.matches.map((m) => playMatch(m, Math.random)),
      rivals: survivors(state.rivals, mode, Math.random),
    });
    if (window.matchMedia("(max-width: 1023px)").matches) {
      requestAnimationFrame(() =>
        panelRef.current?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" }),
      );
    }
  };

  const nextMatches = () => makeMatches(state.round + 1, Math.random);

  return (
    <div className="bg-ink-2 p-3 [--cut:28px] chamfer sm:p-6 lg:p-8">
      <div className="flex flex-col gap-6 px-1 pt-1 sm:px-0 sm:pt-0 md:flex-row md:items-end md:justify-between">
        <RoundTrack round={state.round} />
        <dl className="grid grid-cols-2 gap-8 sm:gap-10">
          <Stat label="En pie">
            <Counter value={alive} />
          </Stat>
          <Stat label="Equipos usados">{state.used.length}</Stat>
        </dl>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-12 lg:gap-6">
        <div className="lg:col-span-8">
          <ul
            className="grid grid-cols-1 gap-2 sm:grid-cols-2"
            aria-label={`Partidas de la ronda ${state.round}`}
          >
            {state.matches.map((m, i) => (
              <MatchCard
                key={`${state.round}-${m.teams[0].id}`}
                match={m}
                result={state.results?.[i] ?? null}
                index={i}
                state={state}
                onSelect={select}
              />
            ))}
          </ul>

          <AnimatePresence>
            {state.phase === "pick" && pickTeam && (
              <motion.div
                className="sticky bottom-3 z-10 mt-3 lg:hidden"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 12 }}
                transition={{ duration: 0.25 }}
              >
                <div className="flex items-center gap-3 bg-ink-4 p-2 pl-3 shadow-[0_20px_50px_-10px_rgb(0_0_0/0.9)] [--cut:12px] chamfer">
                  <Crest team={pickTeam} size="sm" picked />
                  <span className="min-w-0 flex-1 truncate font-semibold">{pickTeam.name}</span>
                  <button type="button" onClick={confirm} className={buttonClass("primary", "sm")}>
                    Confirmar
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div ref={panelRef} className="lg:col-span-4">
          <div
            className="flex min-h-[20rem] flex-col bg-ink-3 p-5 [--cut:16px] chamfer sm:p-6 lg:sticky lg:top-24"
            aria-live="polite"
          >
            <AnimatePresence mode="wait" initial={false}>
              {state.phase === "pick" && !pickTeam && (
                <motion.div
                  key="empty"
                  className="flex flex-1 flex-col"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <span className="grid size-12 place-items-center bg-white/[0.07] [--cut:8px] chamfer">
                    <CrosshairIcon weight="bold" className="size-6" aria-hidden />
                  </span>
                  <p className="mt-6 text-2xl leading-none font-extrabold uppercase [font-stretch:70%]">
                    Elige tu equipo
                  </p>
                  <p className="mt-3 leading-relaxed text-mute">
                    Toca cualquier equipo de la ronda {state.round}.{" "}
                    {mode === "cashout"
                      ? "Si acaba entre los dos primeros de su Cashout, sigues."
                      : "Si gana su Final Round, sigues."}
                  </p>
                </motion.div>
              )}

              {state.phase === "pick" && pickTeam && (
                <motion.div
                  key={`pick-${pickTeam.id}`}
                  className="flex flex-1 flex-col"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25, ease }}
                >
                  <p className="text-sm text-mute">Tu elección para la ronda {state.round}</p>
                  <div className="mt-5 flex items-center gap-4">
                    <Crest team={pickTeam} size="lg" picked />
                    <div className="min-w-0">
                      <p className="truncate text-3xl leading-none font-extrabold uppercase [font-stretch:70%]">
                        {pickTeam.name}
                      </p>
                      <p className="mt-1.5 text-sm text-mute">
                        {modeLabel[mode]} contra {opponents.map((o) => o.name).join(", ")}
                      </p>
                    </div>
                  </div>
                  <p className="mt-6 text-sm leading-relaxed text-mute">
                    Al confirmar, {pickTeam.name} queda bloqueado para el resto del torneo.
                  </p>
                  <button
                    type="button"
                    onClick={confirm}
                    className={buttonClass("primary", "md", "mt-auto w-full")}
                  >
                    Confirmar elección
                  </button>
                </motion.div>
              )}

              {copy && (
                <motion.div
                  key={`result-${state.round}`}
                  className="flex flex-1 flex-col"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <motion.p
                    className={`self-start px-4 py-2 text-3xl leading-none font-black uppercase [font-stretch:62.5%] [--cut:10px] chamfer ${
                      copy.win ? "bg-chalk text-ink" : "bg-pink text-ink"
                    }`}
                    initial={{ opacity: 0, scale: 1.8, rotate: -10 }}
                    animate={{ opacity: 1, scale: 1, rotate: -3 }}
                    transition={
                      reduce ? { duration: 0 } : { delay: 0.55, type: "spring", stiffness: 360, damping: 17 }
                    }
                  >
                    {copy.stamp}
                  </motion.p>
                  <p className="mt-6 leading-relaxed text-mute">{copy.text}</p>

                  <div className="mt-auto flex flex-col gap-2 pt-6">
                    {state.ending === null && (
                      <button
                        type="button"
                        onClick={() => dispatch({ type: "next", matches: nextMatches() })}
                        className={buttonClass("primary", "md", "w-full")}
                      >
                        Siguiente ronda
                        <ArrowRightIcon weight="bold" className="size-[18px]" aria-hidden />
                      </button>
                    )}
                    {canRebuy(state) && (
                      <button
                        type="button"
                        onClick={() => dispatch({ type: "rebuy", matches: nextMatches() })}
                        className={buttonClass("primary", "md", "w-full")}
                      >
                        <ArrowCounterClockwiseIcon weight="bold" className="size-[18px]" aria-hidden />
                        Usar reenganche
                      </button>
                    )}
                    {state.ending !== null && (
                      <button
                        type="button"
                        onClick={() => dispatch({ type: "reset", matches: makeMatches(1, Math.random) })}
                        className={buttonClass("secondary", "md", "w-full")}
                      >
                        <ArrowClockwiseIcon weight="bold" className="size-[18px]" aria-hidden />
                        {state.ending === "out" ? "Empezar de nuevo" : "Jugar otro torneo"}
                      </button>
                    )}
                    {canRebuy(state) && (
                      <p className="pt-1 text-center text-xs text-mute">
                        El reenganche es una ventaja Premium. Aquí puedes probarlo una vez.
                      </p>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
