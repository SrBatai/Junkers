"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  ArrowCounterClockwiseIcon,
  ArrowRightIcon,
  CheckIcon,
  CrosshairIcon,
  FastForwardIcon,
  PlayIcon,
  SignOutIcon,
  XIcon,
} from "@phosphor-icons/react";
import { Counter, MatchGrid, RoundTrack, Stat, describeResult, ease } from "@/components/game/board";
import { buttonClass } from "@/components/ui/button";
import { Crest } from "@/components/ui/crest";
import { modeLabel } from "@/lib/format";
import { modeForRound } from "@/lib/game";
import {
  type League,
  type Profile,
  RIVAL_OPTIONS,
  ROUNDS,
  alivePlayers,
  backersOf,
  canRebuy,
  createLeague,
  emptyProfile,
  isLeague,
  nextRound,
  rebuy,
  resolveRound,
  selectTeam,
  simulateToEnd,
  youOf,
} from "@/lib/league";
import { teamById } from "@/lib/teams";

const LEAGUE_KEY = "last-squad:league";
const PROFILE_KEY = "last-squad:profile";

function readStorage(key: string): unknown {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeStorage(key: string, value: unknown) {
  try {
    if (value === null) window.localStorage.removeItem(key);
    else window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Private mode or blocked storage: the game still works, it just won't be saved.
  }
}

function isProfile(value: unknown): value is Profile {
  return typeof value === "object" && value !== null && typeof (value as Profile).points === "number";
}

/* ------------------------------------------------------------------ setup */

function LeagueSetup({ profile, onCreate }: { profile: Profile; onCreate: (league: League) => void }) {
  const [name, setName] = useState("");
  const [leagueName, setLeagueName] = useState("Camino a Estocolmo");
  const [rivals, setRivals] = useState<number>(15);
  const [error, setError] = useState<string | null>(null);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const you = name.trim();
    const title = leagueName.trim();
    if (you.length < 2 || you.length > 18) {
      setError("Tu nombre tiene que tener entre 2 y 18 caracteres.");
      return;
    }
    onCreate(createLeague(title || "Camino a Estocolmo", you, rivals, Math.random));
  };

  return (
    <div className="grid grid-cols-1 gap-3 lg:grid-cols-12">
      <form
        onSubmit={submit}
        noValidate
        className="flex flex-col gap-8 bg-ink-2 p-6 [--cut:24px] chamfer sm:p-10 lg:col-span-7"
      >
        <div>
          <h1 className="text-5xl display sm:text-6xl">Crea tu liga</h1>
          <p className="mt-4 max-w-[34rem] text-lg leading-relaxed text-mute">
            Seis rondas del Grand Major simulado. Cada jugador elige un equipo por ronda y cada equipo solo se
            puede usar una vez.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="player-name" className="text-sm font-semibold text-chalk">
            Tu nombre
          </label>
          <input
            id="player-name"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setError(null);
            }}
            maxLength={18}
            autoComplete="nickname"
            aria-invalid={error ? true : undefined}
            aria-describedby="player-name-help player-name-error"
            className="h-12 bg-ink-3 px-4 text-chalk outline-none [--cut:8px] chamfer focus-visible:bg-ink-4"
          />
          <p id="player-name-help" className="text-sm text-mute">
            Así te verán tus rivales en la clasificación.
          </p>
          {error && (
            <p id="player-name-error" className="text-sm font-semibold text-pink">
              {error}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="league-name" className="text-sm font-semibold text-chalk">
            Nombre de la liga
          </label>
          <input
            id="league-name"
            value={leagueName}
            onChange={(e) => setLeagueName(e.target.value)}
            maxLength={32}
            className="h-12 bg-ink-3 px-4 text-chalk outline-none [--cut:8px] chamfer focus-visible:bg-ink-4"
          />
        </div>

        <fieldset className="flex flex-col gap-2">
          <legend className="text-sm font-semibold text-chalk">Rivales</legend>
          <div className="mt-2 inline-flex self-start bg-ink-3 p-1 [--cut:10px] chamfer">
            {RIVAL_OPTIONS.map((n) => (
              <label
                key={n}
                className={`cursor-pointer px-5 py-2 font-mono text-sm font-semibold transition-colors [--cut:7px] chamfer has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-pink ${
                  rivals === n ? "bg-chalk text-ink" : "text-mute hover:text-chalk"
                }`}
              >
                <input
                  type="radio"
                  name="rivals"
                  value={n}
                  checked={rivals === n}
                  onChange={() => setRivals(n)}
                  className="sr-only"
                />
                {n}
              </label>
            ))}
          </div>
          <p className="text-sm text-mute">Más rivales, más difícil ser el último en pie.</p>
        </fieldset>

        <button type="submit" className={buttonClass("primary", "lg", "self-start")}>
          Crear liga
          <ArrowRightIcon weight="bold" className="size-[18px]" aria-hidden />
        </button>
      </form>

      <aside className="flex flex-col justify-between gap-10 bg-ink-2 p-6 [--cut:24px] chamfer sm:p-10 lg:col-span-5">
        <div>
          <h2 className="text-3xl display">Tu perfil</h2>
          <dl className="mt-6 grid grid-cols-3 gap-4">
            <Stat label="Puntos">{profile.points}</Stat>
            <Stat label="Ligas">{profile.leagues}</Stat>
            <Stat label="Botes">{profile.wins}</Stat>
          </dl>
        </div>
        <ul className="flex flex-col gap-3 text-mute">
          <li className="flex gap-3">
            <CheckIcon weight="bold" className="mt-1 size-4 shrink-0 text-pink" aria-hidden />
            Cashout: tu equipo tiene que acabar entre los dos primeros.
          </li>
          <li className="flex gap-3">
            <CheckIcon weight="bold" className="mt-1 size-4 shrink-0 text-pink" aria-hidden />
            Final Round: tu equipo tiene que ganar el cara a cara.
          </li>
          <li className="flex gap-3">
            <CheckIcon weight="bold" className="mt-1 size-4 shrink-0 text-pink" aria-hidden />
            Tienes un reenganche por liga para volver cuando caigas.
          </li>
        </ul>
      </aside>
    </div>
  );
}

/* ------------------------------------------------------------------ board */

function Stamp({ children, win }: { children: React.ReactNode; win: boolean }) {
  const reduce = useReducedMotion();
  return (
    <motion.p
      className={`self-start px-4 py-2 text-3xl leading-none font-black uppercase [font-stretch:62.5%] [--cut:10px] chamfer ${
        win ? "bg-chalk text-ink" : "bg-pink text-ink"
      }`}
      initial={{ opacity: 0, scale: 1.8, rotate: -10 }}
      animate={{ opacity: 1, scale: 1, rotate: -3 }}
      transition={reduce ? { duration: 0 } : { delay: 0.5, type: "spring", stiffness: 360, damping: 17 }}
    >
      {children}
    </motion.p>
  );
}

function endingCopy(league: League) {
  const you = youOf(league);
  const winners = league.players.filter((p) => league.winners.includes(p.id));
  const youWon = league.winners.includes(you.id);
  switch (league.ending) {
    case "solo":
      return youWon
        ? { stamp: "Único ganador", win: true, text: "Eres el último en pie. Te llevas el bote entero." }
        : {
            stamp: `Gana ${winners[0].name}`,
            win: false,
            text: `${winners[0].name} es el último en pie y se lleva el bote.`,
          };
    case "split":
      return youWon
        ? {
            stamp: "Reparto del bote",
            win: true,
            text: `Llegas vivo al final junto a ${winners.length - 1} más. El bote se reparte entre ${winners.length}.`,
          }
        : {
            stamp: "Reparto del bote",
            win: false,
            text: `${winners.map((w) => w.name).join(", ")} se reparten el bote.`,
          };
    case "wipeout":
      return {
        stamp: "Todos eliminados",
        win: false,
        text: `Nadie sobrevive a la ronda ${league.round}. La liga se queda sin ganador.`,
      };
    default:
      return null;
  }
}

function ActionPanel({
  league,
  onChange,
  onNewLeague,
}: {
  league: League;
  onChange: (next: League) => void;
  onNewLeague: () => void;
}) {
  const you = youOf(league);
  const alive = alivePlayers(league).length;
  const mode = modeForRound(league.round);
  const myPick = league.phase === "result" ? you.picks[league.round] : null;
  const pickTeam = league.pick ? teamById[league.pick] : null;
  const ending = endingCopy(league);
  const matchOf = (teamId: string) => league.matches.findIndex((m) => m.teams.some((t) => t.id === teamId));

  const confirm = () => onChange(resolveRound(league, Math.random));
  const next = () => onChange(nextRound(league, Math.random));
  const toEnd = () => onChange(simulateToEnd(league, Math.random));

  let key: string;
  let body: React.ReactNode;

  if (ending) {
    key = "ending";
    body = (
      <>
        <Stamp win={ending.win}>{ending.stamp}</Stamp>
        <p className="mt-6 leading-relaxed text-mute">{ending.text}</p>
        {league.points !== null && (
          <p className="mt-4 font-mono text-lg font-semibold text-chalk">+{league.points} puntos</p>
        )}
        <div className="mt-auto flex flex-col gap-2 pt-6">
          <button type="button" onClick={onNewLeague} className={buttonClass("primary", "md", "w-full")}>
            Nueva liga
            <ArrowRightIcon weight="bold" className="size-[18px]" aria-hidden />
          </button>
          <Link href="/" className={buttonClass("secondary", "md", "w-full")}>
            Volver a la web
          </Link>
        </div>
      </>
    );
  } else if (myPick && league.results) {
    const survived = myPick.survived;
    key = `result-${league.round}`;
    body = (
      <>
        <Stamp win={survived}>{survived ? "Sobrevives" : "Eliminado"}</Stamp>
        <p className="mt-6 leading-relaxed text-mute">
          {describeResult(myPick.teamId, league.results[matchOf(myPick.teamId)])}{" "}
          {!survived && mode === "cashout" ? "Solo pasan los dos primeros. " : ""}
          {alive === 1 ? "Queda 1 jugador en pie." : `Quedan ${alive} jugadores en pie.`}
        </p>
        <div className="mt-auto flex flex-col gap-2 pt-6">
          {survived ? (
            <button type="button" onClick={next} className={buttonClass("primary", "md", "w-full")}>
              Siguiente ronda
              <ArrowRightIcon weight="bold" className="size-[18px]" aria-hidden />
            </button>
          ) : (
            <>
              {canRebuy(league) && (
                <button
                  type="button"
                  onClick={() => onChange(rebuy(league))}
                  className={buttonClass("primary", "md", "w-full")}
                >
                  <ArrowCounterClockwiseIcon weight="bold" className="size-[18px]" aria-hidden />
                  Usar reenganche
                </button>
              )}
              <button type="button" onClick={toEnd} className={buttonClass("secondary", "md", "w-full")}>
                <FastForwardIcon weight="bold" className="size-[18px]" aria-hidden />
                Ver cómo acaba
              </button>
            </>
          )}
          {!survived && canRebuy(league) && (
            <p className="pt-1 text-center text-xs text-mute">Reenganche Premium: uno por liga.</p>
          )}
        </div>
      </>
    );
  } else if (you.out !== null) {
    key = `spectate-${league.round}-${league.phase}`;
    body = (
      <>
        <span className="grid size-12 place-items-center bg-pink text-ink [--cut:8px] chamfer">
          <XIcon weight="bold" className="size-6" aria-hidden />
        </span>
        <p className="mt-6 text-2xl leading-none font-extrabold uppercase [font-stretch:70%]">
          Fuera desde la ronda {you.out}
        </p>
        <p className="mt-3 leading-relaxed text-mute">
          {league.phase === "result"
            ? `Ronda ${league.round} jugada. Quedan ${alive} jugadores en pie.`
            : `Quedan ${alive} jugadores en pie. Mira cómo termina la liga.`}
        </p>
        <div className="mt-auto flex flex-col gap-2 pt-6">
          <button
            type="button"
            onClick={league.phase === "result" ? next : confirm}
            className={buttonClass("primary", "md", "w-full")}
          >
            <PlayIcon weight="bold" className="size-[18px]" aria-hidden />
            {league.phase === "result" ? "Siguiente ronda" : `Jugar ronda ${league.round}`}
          </button>
          <button type="button" onClick={toEnd} className={buttonClass("secondary", "md", "w-full")}>
            <FastForwardIcon weight="bold" className="size-[18px]" aria-hidden />
            Ver cómo acaba
          </button>
        </div>
      </>
    );
  } else if (pickTeam) {
    const opponents = league.matches[matchOf(pickTeam.id)].teams.filter((t) => t.id !== pickTeam.id);
    key = `pick-${pickTeam.id}`;
    body = (
      <>
        <p className="text-sm text-mute">Tu elección para la ronda {league.round}</p>
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
          Al confirmar, {pickTeam.name} queda bloqueado para el resto de la liga.
        </p>
        <button type="button" onClick={confirm} className={buttonClass("primary", "md", "mt-auto w-full")}>
          Confirmar elección
        </button>
      </>
    );
  } else {
    key = `empty-${league.round}`;
    body = (
      <>
        <span className="grid size-12 place-items-center bg-white/[0.07] [--cut:8px] chamfer">
          <CrosshairIcon weight="bold" className="size-6" aria-hidden />
        </span>
        <p className="mt-6 text-2xl leading-none font-extrabold uppercase [font-stretch:70%]">
          Elige tu equipo
        </p>
        <p className="mt-3 leading-relaxed text-mute">
          {mode === "cashout"
            ? "Si acaba entre los dos primeros de su Cashout, sigues."
            : "Última ronda: si gana su Final Round, llegas al final."}{" "}
          Tus rivales eligen a la vez y no verás sus equipos hasta el resultado.
        </p>
      </>
    );
  }

  return (
    <div className="flex min-h-[20rem] flex-col bg-ink-3 p-5 [--cut:16px] chamfer sm:p-6" aria-live="polite">
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={key}
          className="flex flex-1 flex-col"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25, ease }}
        >
          {body}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function Standings({ league }: { league: League }) {
  const revealed = league.phase === "result";
  const rows = [...league.players].sort((a, b) => {
    if ((a.out === null) !== (b.out === null)) return a.out === null ? -1 : 1;
    if (a.out !== b.out) return (b.out ?? 0) - (a.out ?? 0);
    if (a.you !== b.you) return a.you ? -1 : 1;
    return a.name.localeCompare(b.name);
  });

  return (
    <section aria-labelledby="standings-title" className="bg-ink-2 p-5 [--cut:16px] chamfer sm:p-6">
      <div className="flex items-baseline justify-between">
        <h2 id="standings-title" className="text-2xl display">
          Clasificación
        </h2>
        <p className="font-mono text-sm text-mute">
          {alivePlayers(league).length}/{league.players.length} en pie
        </p>
      </div>
      <ol className="mt-4 flex max-h-[26rem] flex-col gap-1 overflow-y-auto pr-1">
        {rows.map((p) => {
          const shown = revealed ? p.picks[league.round] : p.picks[league.round - 1];
          const team = shown ? teamById[shown.teamId] : null;
          return (
            <motion.li
              layout
              key={p.id}
              transition={{ duration: 0.4, ease }}
              className={`flex items-center gap-3 px-2.5 py-1.5 [--cut:6px] chamfer ${p.you ? "bg-ink-4" : ""}`}
            >
              <span
                className={`min-w-0 flex-1 truncate text-[15px] font-semibold ${
                  p.out === null ? "text-chalk" : "text-dim line-through"
                }`}
              >
                {p.name}
                {p.you && <span className="ml-2 font-mono text-xs text-pink no-underline">Tú</span>}
              </span>
              {team && <Crest team={team} size="sm" className={shown?.survived ? "" : "opacity-50"} />}
              <span
                className={`w-14 text-right font-mono text-xs ${p.out === null ? "text-chalk" : "text-pink"}`}
              >
                {p.out === null ? "En pie" : `Fuera R${p.out}`}
              </span>
            </motion.li>
          );
        })}
      </ol>
    </section>
  );
}

function History({ league }: { league: League }) {
  const you = youOf(league);
  return (
    <section aria-labelledby="history-title" className="mt-3 bg-ink-2 p-5 [--cut:16px] chamfer sm:p-6">
      <h2 id="history-title" className="text-2xl display">
        Tu recorrido
      </h2>
      <ol className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-6">
        {Array.from({ length: ROUNDS }, (_, i) => i + 1).map((r) => {
          const pick = you.picks[r];
          const team = pick ? teamById[pick.teamId] : null;
          return (
            <li key={r} className="flex flex-col gap-2 bg-ink-3 p-3 [--cut:8px] chamfer">
              <span className="font-mono text-xs text-dim">
                R{r} · {modeLabel[modeForRound(r)]}
              </span>
              {team && pick ? (
                <span className="flex items-center gap-2">
                  <Crest team={team} size="sm" picked={pick.survived} />
                  {pick.survived ? (
                    <CheckIcon weight="bold" className="size-4 text-chalk" aria-label="sobrevive" />
                  ) : (
                    <XIcon weight="bold" className="size-4 text-pink" aria-label="eliminado" />
                  )}
                </span>
              ) : (
                <span className="h-8 font-mono text-sm leading-8 text-dim">-</span>
              )}
            </li>
          );
        })}
      </ol>
    </section>
  );
}

function LeagueBoard({
  league,
  profile,
  onChange,
  onNewLeague,
}: {
  league: League;
  profile: Profile;
  onChange: (next: League) => void;
  onNewLeague: () => void;
}) {
  const you = youOf(league);
  const [confirmLeave, setConfirmLeave] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const pickTeam = league.pick ? teamById[league.pick] : null;
  const canPick = league.phase === "pick" && you.out === null && !league.ending;

  const confirm = () => {
    onChange(resolveRound(league, Math.random));
    if (window.matchMedia("(max-width: 1023px)").matches) {
      requestAnimationFrame(() =>
        panelRef.current?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" }),
      );
    }
  };

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-mono text-xs text-pink">The Grand Major 2026 · simulado</p>
          <h1 className="mt-2 text-5xl display sm:text-6xl">{league.name}</h1>
        </div>
        {!league.ending &&
          (confirmLeave ? (
            <div className="flex items-center gap-2">
              <span className="text-sm text-mute">¿Abandonar? Se pierde la liga.</span>
              <button type="button" onClick={onNewLeague} className={buttonClass("primary", "sm")}>
                Sí, salir
              </button>
              <button
                type="button"
                onClick={() => setConfirmLeave(false)}
                className={buttonClass("secondary", "sm")}
              >
                No
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmLeave(true)}
              className={buttonClass("secondary", "sm")}
            >
              <SignOutIcon weight="bold" className="size-4" aria-hidden />
              Abandonar liga
            </button>
          ))}
      </div>

      <div className="mt-6 bg-ink-2 p-3 [--cut:28px] chamfer sm:p-6 lg:p-8">
        <div className="flex flex-col gap-6 px-1 pt-1 sm:px-0 sm:pt-0 md:flex-row md:items-end md:justify-between">
          <RoundTrack round={league.round} />
          <dl className="grid grid-cols-3 gap-6 sm:gap-10">
            <Stat label="En pie">
              <Counter value={alivePlayers(league).length} />
            </Stat>
            <Stat label="Equipos usados">{you.used.length}</Stat>
            <Stat label="Tus puntos">
              <Counter value={profile.points} />
            </Stat>
          </dl>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-12 lg:gap-6">
          <div className="lg:col-span-8">
            <MatchGrid
              round={league.round}
              matches={league.matches}
              results={league.results}
              pick={league.pick ?? you.picks[league.round]?.teamId ?? null}
              used={you.used}
              revealed={league.phase === "result"}
              interactive={canPick}
              backers={backersOf(league)}
              onSelect={(id) => onChange(selectTeam(league, id))}
            />

            <AnimatePresence>
              {canPick && pickTeam && (
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

          <div ref={panelRef} className="flex flex-col gap-3 lg:col-span-4">
            <ActionPanel league={league} onChange={onChange} onNewLeague={onNewLeague} />
            <Standings league={league} />
          </div>
        </div>
      </div>

      <History league={league} />
    </div>
  );
}

/* ------------------------------------------------------------------ root */

export function LeagueGame() {
  // undefined = still reading storage (first client render matches the server).
  const [league, setLeague] = useState<League | null | undefined>(undefined);
  const [profile, setProfile] = useState<Profile>(emptyProfile);

  useEffect(() => {
    const saved = readStorage(LEAGUE_KEY);
    const savedProfile = readStorage(PROFILE_KEY);
    // Hydrate from localStorage once, after the server-rendered skeleton.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLeague(isLeague(saved) ? saved : null);
    if (isProfile(savedProfile)) setProfile(savedProfile);
  }, []);

  const update = (next: League) => {
    if (league && !league.ending && next.ending && next.points !== null) {
      const won = next.winners.includes("you");
      const nextProfile = {
        points: profile.points + next.points,
        leagues: profile.leagues + 1,
        wins: profile.wins + (won ? 1 : 0),
      };
      setProfile(nextProfile);
      writeStorage(PROFILE_KEY, nextProfile);
    }
    setLeague(next);
    writeStorage(LEAGUE_KEY, next);
  };

  const reset = () => {
    setLeague(null);
    writeStorage(LEAGUE_KEY, null);
  };

  if (league === undefined) {
    return (
      <div aria-busy="true" className="grid grid-cols-1 gap-3 lg:grid-cols-12">
        <div className="h-[34rem] animate-pulse bg-ink-2 [--cut:24px] chamfer lg:col-span-7" />
        <div className="h-[34rem] animate-pulse bg-ink-2 [--cut:24px] chamfer lg:col-span-5" />
      </div>
    );
  }

  if (!league) return <LeagueSetup profile={profile} onCreate={update} />;

  return <LeagueBoard league={league} profile={profile} onChange={update} onNewLeague={reset} />;
}
