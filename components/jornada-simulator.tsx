"use client";

import { useEffect, useReducer, useRef } from "react";
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
import {
  DEMO_ROUNDS,
  type Fixture,
  type GameState,
  type Score,
  canRebuy,
  gameReducer,
  initialGame,
  makeFixtures,
  pickedFixture,
  playMatch,
  survivors,
} from "@/lib/game";
import { type LeagueId, type Team, leagues } from "@/lib/teams";

const ease = [0.16, 1, 0.3, 1] as const;

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

type TeamButtonProps = {
  team: Team;
  rival: Team;
  home: boolean;
  goals: number | null;
  state: GameState;
  onSelect: (id: string) => void;
  delay: number;
};

function TeamButton({ team, rival, home, goals, state, onSelect, delay }: TeamButtonProps) {
  const selected = state.pick === team.id;
  const usedBefore = state.used.includes(team.id) && !(selected && state.phase === "result");
  const locked = state.phase === "result" || usedBefore;

  return (
    <button
      type="button"
      disabled={locked}
      aria-pressed={selected}
      aria-label={
        usedBefore
          ? `${team.name}, ya usado`
          : `Elegir ${team.name} (${home ? "local" : "visitante"}) contra ${rival.name}`
      }
      onClick={() => onSelect(team.id)}
      className={`flex w-full items-center gap-3 px-2.5 py-2 text-left transition-colors duration-200 [--cut:8px] chamfer ${
        selected
          ? "bg-pink text-ink"
          : usedBefore
            ? "cursor-not-allowed text-dim"
            : state.phase === "pick"
              ? "text-chalk hover:bg-white/[0.07]"
              : "text-chalk"
      }`}
    >
      <Crest team={team} size="sm" className={usedBefore ? "opacity-40" : ""} />
      <span
        className={`min-w-0 flex-1 truncate text-[15px] font-semibold ${usedBefore ? "line-through" : ""}`}
      >
        {team.name}
      </span>
      {usedBefore && <LockSimpleIcon weight="bold" className="size-4 shrink-0" aria-hidden />}
      {goals !== null && (
        <motion.span
          className="font-mono text-lg font-semibold tabular-nums"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay, duration: 0.35, ease }}
        >
          {goals}
        </motion.span>
      )}
    </button>
  );
}

function FixtureCard({
  fixture,
  score,
  index,
  state,
  onSelect,
}: {
  fixture: Fixture;
  score: Score | null;
  index: number;
  state: GameState;
  onSelect: (id: string) => void;
}) {
  const mine = state.pick === fixture.home.id || state.pick === fixture.away.id;
  return (
    <li
      className={`p-1.5 transition-colors [--cut:12px] chamfer ${
        mine && state.phase === "result" ? "bg-ink-4" : "bg-ink-3"
      }`}
    >
      <TeamButton
        team={fixture.home}
        rival={fixture.away}
        home
        goals={score?.home ?? null}
        state={state}
        onSelect={onSelect}
        delay={index * 0.06}
      />
      <TeamButton
        team={fixture.away}
        rival={fixture.home}
        home={false}
        goals={score?.away ?? null}
        state={state}
        onSelect={onSelect}
        delay={index * 0.06 + 0.03}
      />
    </li>
  );
}

function resultCopy(state: GameState) {
  const match = pickedFixture(state);
  if (!match || !state.scores || !state.pick) return null;
  const { fixture, index } = match;
  const s = state.scores[index];
  const team = fixture.home.id === state.pick ? fixture.home : fixture.away;
  const line = `${fixture.home.name} ${s.home}-${s.away} ${fixture.away.name}.`;
  const rivals = state.rivals;
  const left = rivals === 1 ? "Queda 1 rival en pie." : `Quedan ${rivals} rivales en pie.`;
  const fellToo =
    state.rivalsBefore === 1
      ? "y tu último rival también cayó"
      : `y tus ${state.rivalsBefore} rivales también cayeron`;

  switch (state.ending) {
    case "solo":
      return {
        stamp: "Único ganador",
        tone: "win",
        text: `${line} Todos tus rivales han caído: te llevas el bote entero.`,
      };
    case "split":
      return {
        stamp: "Reparto del bote",
        tone: "win",
        text: `${line} Llegas vivo al final junto a ${rivals} ${rivals === 1 ? "rival" : "rivales"}. El bote se reparte entre ${rivals + 1}.`,
      };
    case "wipeout":
      return {
        stamp: "Todos eliminados",
        tone: "out",
        text: `${line} ${team.name} no ganó ${fellToo}. Esta liga se queda sin ganador.`,
      };
    case "out":
      return {
        stamp: "Eliminado",
        tone: "out",
        text: `${line} ${state.outcome === "draw" ? "El empate cuenta como derrota." : `${team.name} perdió.`} ${left}`,
      };
    default:
      return {
        stamp: "Sobrevives",
        tone: "win",
        text: `${line} ${team.name} gana y sigues en la liga. ${left}`,
      };
  }
}

export function JornadaSimulator() {
  const [state, dispatch] = useReducer(gameReducer, "laliga" as LeagueId, (id) => initialGame(id));
  const reduce = useReducedMotion();
  const panelRef = useRef<HTMLDivElement>(null);
  const match = pickedFixture(state);
  const pickTeam = match
    ? match.fixture.home.id === state.pick
      ? match.fixture.home
      : match.fixture.away
    : null;
  const pickRival =
    match && pickTeam
      ? match.fixture.home.id === pickTeam.id
        ? match.fixture.away
        : match.fixture.home
      : null;
  const copy = state.phase === "result" ? resultCopy(state) : null;
  const alive = state.rivals + (state.phase === "result" && state.outcome !== "win" ? 0 : 1);

  const freshFixtures = (leagueId: LeagueId = state.leagueId) =>
    makeFixtures(leagues[leagueId].teams, Math.random);

  const select = (id: string) => dispatch({ type: "select", teamId: id });

  const confirm = () => {
    dispatch({
      type: "resolve",
      scores: state.fixtures.map((f) => playMatch(f, Math.random)),
      rivals: survivors(state.rivals, Math.random),
    });
    if (window.matchMedia("(max-width: 1023px)").matches) {
      requestAnimationFrame(() =>
        panelRef.current?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" }),
      );
    }
  };

  const reset = (leagueId: LeagueId = state.leagueId) =>
    dispatch({ type: "reset", leagueId, fixtures: freshFixtures(leagueId) });

  return (
    <div className="bg-ink-2 p-3 [--cut:28px] chamfer sm:p-6 lg:p-8">
      {/* Top bar */}
      <div className="flex flex-col gap-6 px-1 pt-1 sm:px-0 sm:pt-0 md:flex-row md:items-end md:justify-between">
        <div
          role="group"
          aria-label="Competición"
          className="inline-flex self-start bg-ink-3 p-1 [--cut:10px] chamfer"
        >
          {(Object.keys(leagues) as LeagueId[]).map((id) => (
            <button
              key={id}
              type="button"
              aria-pressed={state.leagueId === id}
              onClick={() => state.leagueId !== id && reset(id)}
              className={`px-4 py-2 text-sm font-semibold transition-colors [--cut:7px] chamfer ${
                state.leagueId === id ? "bg-chalk text-ink" : "text-mute hover:text-chalk"
              }`}
            >
              {leagues[id].name}
            </button>
          ))}
        </div>
        <dl className="grid grid-cols-3 gap-6 sm:gap-10">
          <Stat label="Jornada">
            {state.round}
            <span className="text-mute">/{DEMO_ROUNDS}</span>
          </Stat>
          <Stat label="En pie">
            <Counter value={alive} />
          </Stat>
          <Stat label="Equipos usados">{state.used.length}</Stat>
        </dl>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-12 lg:gap-6">
        {/* Fixtures */}
        <div className="lg:col-span-8">
          <ul
            className="grid grid-cols-1 gap-2 sm:grid-cols-2"
            aria-label={`Partidos de la jornada ${state.round}`}
          >
            {state.fixtures.map((f, i) => (
              <FixtureCard
                key={`${state.round}-${f.home.id}`}
                fixture={f}
                score={state.scores?.[i] ?? null}
                index={i}
                state={state}
                onSelect={select}
              />
            ))}
          </ul>

          {/* Mobile quick confirm */}
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
                  <Crest team={pickTeam} size="sm" />
                  <span className="min-w-0 flex-1 truncate font-semibold">{pickTeam.name}</span>
                  <button type="button" onClick={confirm} className={buttonClass("primary", "sm")}>
                    Confirmar
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Panel */}
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
                    Toca cualquier equipo de la jornada {state.round}. Si gana, sigues. Si empata o pierde,
                    estás fuera.
                  </p>
                </motion.div>
              )}

              {state.phase === "pick" && pickTeam && pickRival && (
                <motion.div
                  key={`pick-${pickTeam.id}`}
                  className="flex flex-1 flex-col"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25, ease }}
                >
                  <p className="text-sm text-mute">Tu elección para la jornada {state.round}</p>
                  <div className="mt-5 flex items-center gap-4">
                    <Crest team={pickTeam} size="lg" />
                    <div className="min-w-0">
                      <p className="truncate text-3xl leading-none font-extrabold uppercase [font-stretch:70%]">
                        {pickTeam.name}
                      </p>
                      <p className="mt-1.5 text-sm text-mute">
                        {match?.fixture.home.id === pickTeam.id ? "En casa" : "Fuera"} contra {pickRival.name}
                      </p>
                    </div>
                  </div>
                  <p className="mt-6 text-sm leading-relaxed text-mute">
                    Al confirmar, {pickTeam.name} queda bloqueado para el resto de la liga.
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
                      copy.tone === "win" ? "bg-chalk text-ink" : "bg-pink text-ink"
                    }`}
                    initial={{ opacity: 0, scale: 1.8, rotate: -10 }}
                    animate={{ opacity: 1, scale: 1, rotate: -3 }}
                    transition={
                      reduce ? { duration: 0 } : { delay: 0.45, type: "spring", stiffness: 360, damping: 17 }
                    }
                  >
                    {copy.stamp}
                  </motion.p>
                  <p className="mt-6 leading-relaxed text-mute">{copy.text}</p>

                  <div className="mt-auto flex flex-col gap-2 pt-6">
                    {state.ending === null && (
                      <button
                        type="button"
                        onClick={() => dispatch({ type: "next", fixtures: freshFixtures() })}
                        className={buttonClass("primary", "md", "w-full")}
                      >
                        Siguiente jornada
                        <ArrowRightIcon weight="bold" className="size-[18px]" aria-hidden />
                      </button>
                    )}
                    {canRebuy(state) && (
                      <button
                        type="button"
                        onClick={() => dispatch({ type: "rebuy", fixtures: freshFixtures() })}
                        className={buttonClass("primary", "md", "w-full")}
                      >
                        <ArrowCounterClockwiseIcon weight="bold" className="size-[18px]" aria-hidden />
                        Usar reenganche
                      </button>
                    )}
                    {state.ending !== null && (
                      <button
                        type="button"
                        onClick={() => reset()}
                        className={buttonClass("secondary", "md", "w-full")}
                      >
                        <ArrowClockwiseIcon weight="bold" className="size-[18px]" aria-hidden />
                        {state.ending === "out" ? "Empezar de nuevo" : "Jugar otra liga"}
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
