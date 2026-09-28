// Illustrative picks for the ticker. Not real results.
const picks = [
  { team: "NTMR", mode: "Cashout", result: "1º", ok: true },
  { team: "Fnatic", mode: "Cashout", result: "3º", ok: false },
  { team: "Team Secret", mode: "Final Round", result: "2-1", ok: true },
  { team: "KingZero", mode: "Cashout", result: "2º", ok: true },
  { team: "TSM", mode: "Final Round", result: "0-2", ok: false },
  { team: "Spacestation Gaming", mode: "Cashout", result: "2º", ok: true },
  { team: "777rs", mode: "Cashout", result: "4º", ok: false },
  { team: "Unphased", mode: "Cashout", result: "1º", ok: true },
  { team: "MIRGG", mode: "Final Round", result: "1-2", ok: false },
  { team: "Alliance", mode: "Cashout", result: "2º", ok: true },
];

function Row({ hidden = false }: { hidden?: boolean }) {
  return (
    <ul aria-hidden={hidden || undefined} className="flex shrink-0 items-center">
      {picks.map((p) => (
        <li key={p.team + p.mode} className="flex items-center gap-3 px-6 whitespace-nowrap">
          <span className="text-[15px] font-semibold text-chalk">{p.team}</span>
          <span className="text-[15px] text-mute">{p.mode}</span>
          <span className="font-mono text-[15px] text-chalk tabular-nums">{p.result}</span>
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
            Ronda de ejemplo
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
