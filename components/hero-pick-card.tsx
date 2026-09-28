"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useInView, useReducedMotion } from "motion/react";
import { Crest } from "@/components/ui/crest";
import { formatCash, modeLabel } from "@/lib/format";
import { teamById as t } from "@/lib/teams";

// Illustrative rounds for the hero loop. Not real results.
const scenes = [
  {
    round: 2,
    mode: "cashout",
    pick: "fnatic",
    rows: [
      { team: t.ntmr, value: formatCash(24300) },
      { team: t.fnatic, value: formatCash(17850) },
      { team: t.tsm, value: formatCash(11200) },
      { team: t.gunflix, value: formatCash(6950) },
    ],
    survived: true,
    note: "2º de 4. Pasan los dos primeros.",
  },
  {
    round: 3,
    mode: "cashout",
    pick: "kingzero",
    rows: [
      { team: t.secret, value: formatCash(26100) },
      { team: t.ssg, value: formatCash(19400) },
      { team: t.kingzero, value: formatCash(15750) },
      { team: t.hanabi, value: formatCash(8300) },
    ],
    survived: false,
    note: "3º de 4. Se queda fuera.",
  },
  {
    round: 6,
    mode: "final",
    pick: "unphased",
    rows: [
      { team: t.unphased, value: "2" },
      { team: t.alliance, value: "1" },
    ],
    survived: true,
    note: "Gana el cara a cara.",
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
    const id = window.setInterval(() => setI((n) => (n + 1) % scenes.length), 4200);
    return () => window.clearInterval(id);
  }, [reduce, inView]);

  const s = scenes[i];

  return (
    <div
      ref={ref}
      className={`bg-ink-2/95 p-5 shadow-[0_30px_80px_-20px_rgb(0_0_0/0.8)] backdrop-blur-md [--cut:14px] chamfer sm:p-6 ${className}`}
    >
      <div className="flex items-center justify-between font-mono text-xs text-mute">
        <span>
          Ronda {s.round} · {modeLabel[s.mode]}
        </span>
        <span>Ejemplo</span>
      </div>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={s.round}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.35, ease }}
        >
          <ol className="mt-4 space-y-2">
            {s.rows.map(({ team, value }, place) => {
              const picked = team.id === s.pick;
              return (
                <li key={team.id} className="flex items-center gap-3">
                  <span className="w-5 font-mono text-xs text-dim">{place + 1}º</span>
                  <Crest team={team} size="sm" picked={picked} />
                  <span
                    className={`min-w-0 flex-1 truncate text-[15px] font-semibold ${picked ? "text-chalk" : "text-mute"}`}
                  >
                    {team.name}
                  </span>
                  <motion.span
                    className="font-mono text-sm font-semibold text-chalk tabular-nums"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: reduce ? 0 : 0.5 + place * 0.08, duration: 0.3 }}
                  >
                    {value}
                  </motion.span>
                </li>
              );
            })}
          </ol>

          <div className="mt-5 flex items-center justify-between gap-3 border-t border-white/[0.08] pt-4">
            <span className="text-sm text-mute">{s.note}</span>
            <motion.span
              className={`shrink-0 px-3 py-1.5 text-[13px] font-black tracking-[0.06em] uppercase [font-stretch:75%] [--cut:6px] chamfer ${
                s.survived ? "bg-chalk text-ink" : "bg-pink text-ink"
              }`}
              initial={{ opacity: 0, scale: 1.6, rotate: -8 }}
              animate={{ opacity: 1, scale: 1, rotate: -3 }}
              transition={
                reduce ? { duration: 0 } : { delay: 1.1, type: "spring", stiffness: 380, damping: 18 }
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
