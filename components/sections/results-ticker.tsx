// Illustrative picks for the ticker. Not real results.
const picks = [
  { pick: "Real Betis", rival: "Getafe", score: "2-0", ok: true },
  { pick: "Arsenal", rival: "Brentford", score: "3-1", ok: true },
  { pick: "Villarreal", rival: "Celta", score: "1-1", ok: false },
  { pick: "Liverpool", rival: "West Ham", score: "2-0", ok: true },
  { pick: "Athletic", rival: "Osasuna", score: "0-1", ok: false },
  { pick: "Real Madrid", rival: "Valencia", score: "4-1", ok: true },
  { pick: "Chelsea", rival: "Crystal Palace", score: "1-1", ok: false },
  { pick: "Real Sociedad", rival: "Sevilla", score: "2-1", ok: true },
  { pick: "Man City", rival: "Brighton", score: "3-0", ok: true },
  { pick: "Atlético", rival: "Getafe", score: "0-0", ok: false },
];

function Row({ hidden = false }: { hidden?: boolean }) {
  return (
    <ul aria-hidden={hidden || undefined} className="flex shrink-0 items-center">
      {picks.map((p) => (
        <li key={p.pick + p.rival} className="flex items-center gap-3 px-6 whitespace-nowrap">
          <span className="text-[15px] font-semibold text-chalk">{p.pick}</span>
          <span className="font-mono text-[15px] text-chalk tabular-nums">{p.score}</span>
          <span className="text-[15px] text-mute">{p.rival}</span>
          <span
            className={`ml-1 text-xs font-black tracking-[0.08em] uppercase [font-stretch:75%] ${
              p.ok ? "text-chalk/70" : "text-pink"
            }`}
          >
            {p.ok ? "Sobrevive" : "Eliminado"}
          </span>
          <span aria-hidden className="ml-5 h-4 w-px bg-white/15" />
        </li>
      ))}
    </ul>
  );
}

export function ResultsTicker() {
  return (
    <section aria-label="Resultados de ejemplo" className="relative border-y border-white/[0.07] bg-ink-2">
      <div className="flex h-14 items-stretch">
        <div className="relative z-10 flex shrink-0 items-center gap-3 bg-pink px-4 text-ink sm:px-6">
          <span className="text-[13px] font-black tracking-[0.08em] uppercase [font-stretch:75%]">
            Jornada de ejemplo
          </span>
        </div>
        <div className="relative flex min-w-0 flex-1 overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_6%,#000_94%,transparent)]">
          <div className="flex w-max animate-marquee">
            <Row />
            <Row hidden />
          </div>
        </div>
      </div>
    </section>
  );
}
