"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useInView, useReducedMotion } from "motion/react";
import { Crest } from "@/components/ui/crest";
import { leagues } from "@/lib/teams";

const t = Object.fromEntries(leagues.laliga.teams.map((team) => [team.id, team]));

// Illustrative picks for the hero loop. Not real results.
const scenes = [
  { round: 12, pick: t.bet, rival: t.get, score: [2, 0], survived: true, note: "Gana. Sigues vivo." },
  { round: 13, pick: t.ath, rival: t.osa, score: [3, 1], survived: true, note: "Gana. Sigues vivo." },
  {
    round: 14,
    pick: t.vil,
    rival: t.cel,
    score: [1, 1],
    survived: false,
    note: "Empate. Cuenta como derrota.",
  },
] as const;

const ease = [0.16, 1, 0.3, 1] as const;

export function HeroPickCard({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.4 });
  const reduce = useReducedMotion();
  const [i, setI] = useState(0);

  useEffect(() => {
    if (reduce || !inView) return;
    const id = window.setInterval(() => setI((n) => (n + 1) % scenes.length), 3800);
    return () => window.clearInterval(id);
  }, [reduce, inView]);

  const s = scenes[i];

  return (
    <div
      ref={ref}
      className={`bg-ink-2/95 p-5 shadow-[0_30px_80px_-20px_rgb(0_0_0/0.8)] backdrop-blur-md [--cut:14px] chamfer sm:p-6 ${className}`}
    >
      <div className="flex items-center justify-between font-mono text-xs text-mute">
        <span>Jornada {s.round}</span>
        <span>LaLiga</span>
      </div>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={s.round}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.35, ease }}
        >
          <p className="mt-4 text-sm text-mute">Tu elección</p>
          <div className="mt-3 space-y-2.5">
            {[
              { team: s.pick, goals: s.score[0], picked: true },
              { team: s.rival, goals: s.score[1], picked: false },
            ].map(({ team, goals, picked }) => (
              <div key={team.id} className="flex items-center gap-3">
                <Crest team={team} size="sm" />
                <span className={`flex-1 text-[15px] font-semibold ${picked ? "text-chalk" : "text-mute"}`}>
                  {team.name}
                </span>
                <motion.span
                  className="font-mono text-xl font-semibold tabular-nums"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: reduce ? 0 : 0.6, duration: 0.3 }}
                >
                  {goals}
                </motion.span>
              </div>
            ))}
          </div>

          <div className="mt-5 flex items-center justify-between gap-3 border-t border-white/[0.08] pt-4">
            <span className="text-sm text-mute">{s.note}</span>
            <motion.span
              className={`px-3 py-1.5 text-[13px] font-black tracking-[0.06em] uppercase [font-stretch:75%] [--cut:6px] chamfer ${
                s.survived ? "bg-chalk text-ink" : "bg-pink text-ink"
              }`}
              initial={{ opacity: 0, scale: 1.6, rotate: -8 }}
              animate={{ opacity: 1, scale: 1, rotate: -3 }}
              transition={
                reduce ? { duration: 0 } : { delay: 1.05, type: "spring", stiffness: 380, damping: 18 }
              }
            >
              {s.survived ? "Sobrevives" : "Eliminado"}
            </motion.span>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
