"use client";

import { Fragment, useEffect } from "react";
import { animate, motion, useMotionValue, useReducedMotion, useTransform } from "motion/react";
import { LockSimpleIcon, UsersIcon } from "@phosphor-icons/react";
import { Crest } from "@/components/ui/crest";
import { formatCash, modeLabel } from "@/lib/format";
import { DEMO_ROUNDS, type Match, type MatchResult, modeForRound, placementOf } from "@/lib/game";
import { type Team, teamById } from "@/lib/teams";

export const ease = [0.16, 1, 0.3, 1] as const;
const letters = "ABCDEFGH";

export function Counter({ value }: { value: number }) {
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

export function Stat({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col">
      <dt className="text-xs text-mute">{label}</dt>
      <dd className="font-mono text-2xl font-semibold text-chalk tabular-nums">{children}</dd>
    </div>
  );
}

export function RoundTrack({ round }: { round: number }) {
  const mode = modeForRound(round);
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
          Ronda {round}: {modeLabel[mode]}.
        </span>{" "}
        {mode === "cashout"
          ? "Cuatro equipos por partida, pasan los dos primeros."
          : "Cara a cara: solo vale ganar."}
      </p>
    </div>
  );
}

export type BoardSelection = {
  /** The viewer's current pick, if any. */
  pick: string | null;
  /** Teams the viewer already burned in earlier rounds. */
  used: string[];
  /** Results are on screen. */
  revealed: boolean;
  /** The viewer can pick this round (false while spectating). */
  interactive: boolean;
  onSelect: (id: string) => void;
  /** How many players backed each team this round (shown after the reveal). */
  backers?: Record<string, number>;
};

type RowProps = BoardSelection & {
  team: Team;
  others: Team[];
  mode: Match["mode"];
  place: number | null;
  value: string | null;
};

function TeamRow({
  team,
  others,
  mode,
  place,
  value,
  pick,
  used,
  revealed,
  interactive,
  onSelect,
  backers,
}: RowProps) {
  const selected = pick === team.id;
  const usedBefore = used.includes(team.id) && !(selected && revealed);
  const locked = revealed || usedBefore || !interactive;
  const out = place !== null && (mode === "cashout" ? place > 1 : place > 0);
  const count = revealed ? (backers?.[team.id] ?? 0) : 0;

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
              : !revealed && interactive
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
        {count > 0 && (
          <span
            className={`flex items-center gap-1 font-mono text-xs ${selected ? "text-ink/70" : "text-mute"}`}
            title={`${count} ${count === 1 ? "jugador lo eligió" : "jugadores lo eligieron"}`}
          >
            <UsersIcon weight="bold" className="size-3.5" aria-hidden />
            {count}
          </span>
        )}
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

export function MatchCard({
  match,
  result,
  index,
  ...selection
}: BoardSelection & { match: Match; result: MatchResult | null; index: number }) {
  const mine = match.teams.some((t) => t.id === selection.pick);
  const rows = result ? result.order : match.teams;

  return (
    <li
      className={`p-1.5 transition-colors [--cut:12px] chamfer ${mine && selection.revealed ? "bg-ink-4" : "bg-ink-3"}`}
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
                {...selection}
                team={team}
                others={match.teams.filter((t) => t.id !== team.id)}
                mode={match.mode}
                place={result ? i : null}
                value={value}
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

export function MatchGrid({
  round,
  matches,
  results,
  ...selection
}: BoardSelection & { round: number; matches: Match[]; results: MatchResult[] | null }) {
  return (
    <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2" aria-label={`Partidas de la ronda ${round}`}>
      {matches.map((m, i) => (
        <MatchCard
          key={`${round}-${m.teams[0].id}`}
          {...selection}
          match={m}
          result={results?.[i] ?? null}
          index={i}
        />
      ))}
    </ul>
  );
}

/** "NTMR acaba 2º de 4 con 17.850 $." / "NTMR gana 2-1 a TSM." */
export function describeResult(teamId: string, result: MatchResult) {
  const team = teamById[teamId];
  const place = placementOf(teamId, result);
  if (result.mode === "cashout") {
    return `${team.name} acaba ${place + 1}º de 4 con ${formatCash(result.cash[place])}.`;
  }
  const rival = result.order.find((t) => t.id !== teamId)!;
  const [w, l] = result.score;
  return place === 0
    ? `${team.name} gana ${w}-${l} a ${rival.name}.`
    : `${team.name} cae ${l}-${w} ante ${rival.name}.`;
}
