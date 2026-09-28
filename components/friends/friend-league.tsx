"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "motion/react";
import {
  ArrowCounterClockwiseIcon,
  ArrowRightIcon,
  CheckIcon,
  CopyIcon,
  CrownIcon,
  HourglassIcon,
  PlayIcon,
  SignOutIcon,
  XIcon,
} from "@phosphor-icons/react";
import { MatchGrid, RoundTrack, Stat, describeResult } from "@/components/game/board";
import { buttonClass } from "@/components/ui/button";
import { Crest } from "@/components/ui/crest";
import { applyRebuy, leaveLeague, nextRound, resolveRound, startLeague, submitPick } from "@/lib/actions";
import { type FriendLeagueState, type Member, loadMatches, loadResults } from "@/lib/friends";
import { modeLabel } from "@/lib/format";
import { DEMO_ROUNDS as ROUNDS, modeForRound } from "@/lib/game";
import { teamById } from "@/lib/teams";

const POLL_MS = 6000;

function Stamp({ children, win }: { children: React.ReactNode; win: boolean }) {
  const reduce = useReducedMotion();
  return (
    <motion.p
      className={`self-start px-4 py-2 text-3xl leading-none font-black uppercase [font-stretch:62.5%] [--cut:10px] chamfer ${
        win ? "bg-chalk text-ink" : "bg-pink text-ink"
      }`}
      initial={{ opacity: 0, scale: 1.8, rotate: -10 }}
      animate={{ opacity: 1, scale: 1, rotate: -3 }}
      transition={reduce ? { duration: 0 } : { delay: 0.3, type: "spring", stiffness: 360, damping: 17 }}
    >
      {children}
    </motion.p>
  );
}

function InvitePanel({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/ligas/unirse/${code}`);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };
  return (
    <div className="flex flex-col gap-4 bg-ink-3 p-5 [--cut:16px] chamfer sm:p-6">
      <p className="text-sm text-mute">Código de invitación</p>
      <p className="font-mono text-4xl font-semibold tracking-[0.3em] text-chalk">{code}</p>
      <button type="button" onClick={copy} className={buttonClass("secondary", "sm", "self-start")}>
        {copied ? (
          <CheckIcon weight="bold" className="size-4" aria-hidden />
        ) : (
          <CopyIcon weight="bold" className="size-4" aria-hidden />
        )}
        {copied ? "Enlace copiado" : "Copiar enlace"}
      </button>
    </div>
  );
}

function Standings({ state }: { state: FriendLeagueState }) {
  const { league, members, current } = state;
  const revealed = Boolean(current?.results);
  const rows = [...members].sort((a, b) => {
    if ((a.out_round === null) !== (b.out_round === null)) return a.out_round === null ? -1 : 1;
    if (a.out_round !== b.out_round) return (b.out_round ?? 0) - (a.out_round ?? 0);
    return a.username.localeCompare(b.username);
  });

  return (
    <section aria-labelledby="standings-title" className="bg-ink-2 p-5 [--cut:16px] chamfer sm:p-6">
      <div className="flex items-baseline justify-between">
        <h2 id="standings-title" className="text-2xl display">
          {league.status === "lobby" ? "Jugadores" : "Clasificación"}
        </h2>
        <p className="font-mono text-sm text-mute">
          {league.status === "lobby"
            ? `${members.length}/24`
            : `${members.filter((m) => m.out_round === null).length}/${members.length} en pie`}
        </p>
      </div>
      <ol className="mt-4 flex flex-col gap-1">
        {rows.map((m) => {
          const pick = m.picks.find((p) => p.round === league.round);
          const shownTeam = revealed && pick ? teamById[pick.team_id] : null;
          const me = m.id === state.me;
          return (
            <li
              key={m.id}
              className={`flex items-center gap-3 px-2.5 py-1.5 [--cut:6px] chamfer ${me ? "bg-ink-4" : ""}`}
            >
              <span
                className={`min-w-0 flex-1 truncate text-[15px] font-semibold ${
                  m.out_round === null ? "text-chalk" : "text-dim line-through"
                }`}
              >
                {m.username}
                {m.id === league.owner_id && (
                  <CrownIcon
                    weight="fill"
                    className="ml-1.5 inline size-3.5 text-pink"
                    aria-label="creador"
                  />
                )}
                {me && <span className="ml-2 font-mono text-xs text-pink">Tú</span>}
              </span>
              {league.status === "playing" && !revealed && m.out_round === null && (
                <span className={`font-mono text-xs ${m.picked ? "text-chalk" : "text-dim"}`}>
                  {m.picked ? "Ha elegido" : "Pensando"}
                </span>
              )}
              {shownTeam && (
                <Crest team={shownTeam} size="sm" className={pick?.survived ? "" : "opacity-50"} />
              )}
              {league.status !== "lobby" && (
                <span
                  className={`w-16 text-right font-mono text-xs ${
                    m.winner ? "text-pink" : m.out_round === null ? "text-chalk" : "text-pink"
                  }`}
                >
                  {m.winner ? "Gana" : m.out_round === null ? "En pie" : `Fuera R${m.out_round}`}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </section>
  );
}

function History({ me }: { me: Member }) {
  return (
    <section aria-labelledby="history-title" className="mt-3 bg-ink-2 p-5 [--cut:16px] chamfer sm:p-6">
      <h2 id="history-title" className="text-2xl display">
        Tu recorrido
      </h2>
      <ol className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-6">
        {Array.from({ length: ROUNDS }, (_, i) => i + 1).map((r) => {
          const pick = me.picks.find((p) => p.round === r);
          const team = pick ? teamById[pick.team_id] : null;
          return (
            <li key={r} className="flex flex-col gap-2 bg-ink-3 p-3 [--cut:8px] chamfer">
              <span className="font-mono text-xs text-dim">
                R{r} · {modeLabel[modeForRound(r)]}
              </span>
              {team && pick ? (
                <span className="flex items-center gap-2">
                  <Crest team={team} size="sm" picked={pick.survived === true} />
                  {pick.survived === true && (
                    <CheckIcon weight="bold" className="size-4 text-chalk" aria-label="sobrevive" />
                  )}
                  {pick.survived === false && (
                    <XIcon weight="bold" className="size-4 text-pink" aria-label="eliminado" />
                  )}
                  {pick.survived === null && (
                    <HourglassIcon weight="bold" className="size-4 text-mute" aria-label="pendiente" />
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

export function FriendLeague({ state }: { state: FriendLeagueState }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [optimisticPick, setOptimisticPick] = useState<{ round: number; team: string } | null>(null);
  const [confirmLeave, setConfirmLeave] = useState(false);

  const { league, members, current } = state;
  const me = members.find((m) => m.id === state.me)!;
  const owner = members.find((m) => m.id === league.owner_id);
  const alive = members.filter((m) => m.out_round === null);
  const revealed = Boolean(current?.results);
  const matches = current ? loadMatches(current.matches) : [];
  const results = current?.results ? loadResults(current.results) : null;
  const serverPick = me.picks.find((p) => p.round === league.round) ?? null;
  const myPick =
    optimisticPick && optimisticPick.round === league.round
      ? optimisticPick.team
      : (serverPick?.team_id ?? null);
  const used = me.picks.filter((p) => p.round < league.round).map((p) => p.team_id);
  const iAmAlive = me.out_round === null;
  const pickedCount = alive.filter((m) => m.picked).length;

  // Keep everyone's screen in sync while the league is live.
  useEffect(() => {
    if (league.status === "finished") return;
    const id = window.setInterval(() => {
      if (document.visibilityState === "visible") router.refresh();
    }, POLL_MS);
    return () => window.clearInterval(id);
  }, [league.status, router]);

  const act = (work: () => Promise<{ error: string | null } | undefined>) => {
    setError(null);
    startTransition(async () => {
      const result = await work();
      if (result?.error) setError(result.error);
      router.refresh();
    });
  };

  const pick = (teamId: string) => {
    if (!iAmAlive || revealed || league.status !== "playing") return;
    setOptimisticPick({ round: league.round, team: teamId });
    act(() => submitPick(league.id, teamId));
  };

  const backers: Record<string, number> = {};
  if (revealed) {
    for (const m of members) {
      const p = m.picks.find((x) => x.round === league.round);
      if (p) backers[p.team_id] = (backers[p.team_id] ?? 0) + 1;
    }
  }

  const matchResultFor = (teamId: string) => {
    const index = matches.findIndex((m) => m.teams.some((t) => t.id === teamId));
    return results?.[index] ?? null;
  };

  /* ---------------------------------------------------------------- action panel */

  let panel: React.ReactNode;
  if (league.status === "lobby") {
    panel = (
      <>
        <p className="text-2xl leading-none font-extrabold uppercase [font-stretch:70%]">Sala de espera</p>
        <p className="mt-3 leading-relaxed text-mute">
          {league.is_owner
            ? "Comparte el código. Cuando estéis todos, empieza la liga: a partir de ahí nadie más puede entrar."
            : `Esperando a que ${owner?.username ?? "el creador"} empiece la liga.`}
        </p>
        {league.is_owner && (
          <button
            type="button"
            disabled={pending || members.length < 2}
            onClick={() => act(() => startLeague(league.id))}
            className={buttonClass("primary", "md", "mt-auto w-full disabled:opacity-50")}
          >
            <PlayIcon weight="bold" className="size-[18px]" aria-hidden />
            {members.length < 2 ? "Faltan jugadores" : "Empezar liga"}
          </button>
        )}
      </>
    );
  } else if (league.status === "finished") {
    const winners = members.filter((m) => m.winner);
    const iWon = me.winner;
    const stamp =
      league.ending === "wipeout"
        ? "Todos eliminados"
        : league.ending === "solo"
          ? iWon
            ? "Único ganador"
            : `Gana ${winners[0]?.username ?? ""}`
          : "Reparto del bote";
    const text =
      league.ending === "wipeout"
        ? `Nadie sobrevive a la ronda ${league.round}. La liga se queda sin ganador.`
        : league.ending === "solo"
          ? iWon
            ? "Eres el último en pie. El bote es tuyo."
            : `${winners[0]?.username} es el último en pie y se lleva el bote.`
          : `${winners.map((w) => w.username).join(", ")} se reparten el bote.`;
    panel = (
      <>
        <Stamp win={iWon}>{stamp}</Stamp>
        <p className="mt-6 leading-relaxed text-mute">{text}</p>
      </>
    );
  } else if (revealed) {
    const myResult = serverPick ? matchResultFor(serverPick.team_id) : null;
    const fellNow = me.out_round === league.round;
    const canRebuy = fellNow && !me.rebuy_used && league.round < ROUNDS;
    panel = (
      <>
        {serverPick && myResult ? (
          <>
            <Stamp win={serverPick.survived === true || me.out_round === null}>
              {serverPick.survived ? "Sobrevives" : me.out_round === null ? "Reenganchado" : "Eliminado"}
            </Stamp>
            <p className="mt-6 leading-relaxed text-mute">
              {describeResult(serverPick.team_id, myResult)} Quedan {alive.length} en pie.
            </p>
          </>
        ) : fellNow ? (
          <>
            <Stamp win={false}>Eliminado</Stamp>
            <p className="mt-6 leading-relaxed text-mute">No elegiste equipo a tiempo.</p>
          </>
        ) : (
          <p className="leading-relaxed text-mute">
            Ronda {league.round} jugada. Quedan {alive.length} en pie.
          </p>
        )}
        <div className="mt-auto flex flex-col gap-2 pt-6">
          {canRebuy && (
            <button
              type="button"
              disabled={pending}
              onClick={() => act(() => applyRebuy(league.id))}
              className={buttonClass("primary", "md", "w-full")}
            >
              <ArrowCounterClockwiseIcon weight="bold" className="size-[18px]" aria-hidden />
              Usar reenganche
            </button>
          )}
          {league.is_owner ? (
            <button
              type="button"
              disabled={pending}
              onClick={() => act(() => nextRound(league.id, league.round))}
              className={buttonClass(canRebuy ? "secondary" : "primary", "md", "w-full")}
            >
              Abrir ronda {league.round + 1}
              <ArrowRightIcon weight="bold" className="size-[18px]" aria-hidden />
            </button>
          ) : (
            <p className="text-sm text-mute">Esperando a que {owner?.username} abra la siguiente ronda.</p>
          )}
        </div>
      </>
    );
  } else {
    const pickTeam = myPick ? teamById[myPick] : null;
    panel = (
      <>
        {iAmAlive ? (
          pickTeam ? (
            <>
              <p className="text-sm text-mute">Tu elección para la ronda {league.round}</p>
              <div className="mt-4 flex items-center gap-4">
                <Crest team={pickTeam} size="lg" picked />
                <p className="truncate text-3xl leading-none font-extrabold uppercase [font-stretch:70%]">
                  {pickTeam.name}
                </p>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-mute">
                Guardada. Puedes cambiarla hasta que se juegue la ronda.
              </p>
            </>
          ) : (
            <>
              <p className="text-2xl leading-none font-extrabold uppercase [font-stretch:70%]">
                Elige tu equipo
              </p>
              <p className="mt-3 leading-relaxed text-mute">
                {modeForRound(league.round) === "cashout"
                  ? "Tiene que acabar entre los dos primeros de su Cashout."
                  : "Última ronda: tiene que ganar su Final Round."}{" "}
                Si no eliges antes de que se juegue la ronda, quedas eliminado.
              </p>
            </>
          )
        ) : (
          <>
            <p className="text-2xl leading-none font-extrabold uppercase [font-stretch:70%]">
              Fuera desde la ronda {me.out_round}
            </p>
            <p className="mt-3 leading-relaxed text-mute">Sigue la liga hasta el final.</p>
          </>
        )}
        <div className="mt-auto flex flex-col gap-2 pt-6">
          <p className="font-mono text-sm text-mute">
            Han elegido {pickedCount} de {alive.length}
          </p>
          {league.is_owner && (
            <button
              type="button"
              disabled={pending}
              onClick={() => act(() => resolveRound(league.id))}
              className={buttonClass("primary", "md", "w-full")}
            >
              <PlayIcon weight="bold" className="size-[18px]" aria-hidden />
              Jugar ronda {league.round}
            </button>
          )}
          {league.is_owner && pickedCount < alive.length && (
            <p className="text-xs text-mute">Quien no haya elegido quedará eliminado.</p>
          )}
        </div>
      </>
    );
  }

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-mono text-xs text-pink">Liga con amigos · The Grand Major 2026 simulado</p>
          <h1 className="mt-2 text-5xl display sm:text-6xl">{league.name}</h1>
        </div>
        {(league.status === "lobby" || league.is_owner) &&
          (confirmLeave ? (
            <div className="flex items-center gap-2">
              <span className="text-sm text-mute">
                {league.is_owner ? "¿Borrar la liga para todos?" : "¿Salir de la liga?"}
              </span>
              <button
                type="button"
                disabled={pending}
                onClick={() => act(() => leaveLeague(league.id))}
                className={buttonClass("primary", "sm")}
              >
                Sí
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
              {league.is_owner ? "Borrar liga" : "Salir"}
            </button>
          ))}
      </div>

      {error && (
        <p
          role="alert"
          className="mt-4 bg-pink-deep px-4 py-3 text-sm font-semibold text-chalk [--cut:8px] chamfer"
        >
          {error}
        </p>
      )}

      <div className="mt-6 bg-ink-2 p-3 [--cut:28px] chamfer sm:p-6 lg:p-8">
        {league.status !== "lobby" && (
          <div className="mb-6 flex flex-col gap-6 px-1 pt-1 sm:px-0 sm:pt-0 md:flex-row md:items-end md:justify-between">
            <RoundTrack round={league.round} />
            <dl className="grid grid-cols-2 gap-8 sm:gap-10">
              <Stat label="En pie">
                {alive.length}
                <span className="text-mute">/{members.length}</span>
              </Stat>
              <Stat label="Equipos usados">{used.length + (serverPick ? 1 : 0)}</Stat>
            </dl>
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:gap-6">
          <div className="lg:col-span-8">
            {league.status === "lobby" ? (
              <div className="flex h-full flex-col justify-center gap-4 bg-ink-3 p-6 [--cut:16px] chamfer sm:p-10">
                <p className="text-4xl display">Así se juega</p>
                <ul className="flex flex-col gap-3 text-mute">
                  <li>Seis rondas: cinco Cashouts y una Final Round.</li>
                  <li>Cada ronda eliges un equipo. Cada equipo solo lo puedes usar una vez.</li>
                  <li>En Cashout tu equipo debe acabar entre los dos primeros; en la Final Round, ganar.</li>
                  <li>Nadie ve tu equipo hasta que se juega la ronda.</li>
                  <li>Tienes un reenganche por liga.</li>
                </ul>
              </div>
            ) : (
              <MatchGrid
                round={league.round}
                matches={matches}
                results={results}
                pick={myPick}
                used={used}
                revealed={revealed}
                interactive={iAmAlive && !revealed && league.status === "playing" && !pending}
                backers={backers}
                onSelect={pick}
              />
            )}
          </div>

          <div className="flex flex-col gap-3 lg:col-span-4">
            {league.status === "lobby" && <InvitePanel code={league.invite_code} />}
            <div
              className="flex min-h-[18rem] flex-col bg-ink-3 p-5 [--cut:16px] chamfer sm:p-6"
              aria-live="polite"
              aria-busy={pending}
            >
              {panel}
            </div>
            <Standings state={state} />
          </div>
        </div>
      </div>

      {league.status !== "lobby" && <History me={me} />}
    </div>
  );
}
