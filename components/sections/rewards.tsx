import {
  ArrowCounterClockwiseIcon,
  CalendarCheckIcon,
  CrownIcon,
  GiftIcon,
  MedalIcon,
  ShuffleIcon,
  SparkleIcon,
} from "@phosphor-icons/react/dist/ssr";
import { Reveal } from "@/components/ui/reveal";

const earn = [
  { icon: GiftIcon, label: "Bono de bienvenida" },
  { icon: CalendarCheckIcon, label: "Bono diario" },
  { icon: MedalIcon, label: "Recompensa por cada competición que completes" },
];

const spend = [
  "Crear nuevas ligas y torneos",
  "Desbloquear funciones y ventajas exclusivas",
  "Conseguir avatares únicos",
  "Acceder a contenido Premium",
];

const premium = [
  {
    icon: ShuffleIcon,
    title: "Condiciones de victoria aleatorias",
    body: "Partidas con reglas especiales que cambian la forma de sobrevivir.",
  },
  {
    icon: ArrowCounterClockwiseIcon,
    title: "Reenganche",
    body: "Vuelve a la competición cuando parecías eliminado.",
  },
  {
    icon: SparkleIcon,
    title: "Más ventajas en cada actualización",
    body: "Nuevas ventajas exclusivas conforme crece el juego.",
  },
];

export function Rewards() {
  return (
    <section id="premium" className="mx-auto max-w-[1400px] px-4 py-20 sm:px-6 lg:px-10 lg:py-28">
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        {/* Points */}
        <Reveal className="flex flex-col bg-ink-2 p-6 [--cut:24px] chamfer sm:p-10">
          <h2 className="text-5xl display sm:text-6xl">Ganar tiene premio</h2>
          <p className="mt-5 max-w-[30rem] text-lg leading-relaxed text-mute">
            Al terminar una liga o un torneo acumulas puntos. Se ganan jugando, sin compras obligatorias.
          </p>

          <div className="mt-10 grid grid-cols-1 gap-10 sm:grid-cols-2 sm:gap-6">
            <div>
              <h3 className="font-mono text-sm text-chalk">Cómo se ganan</h3>
              <ul className="mt-5 flex flex-col gap-4">
                {earn.map(({ icon: Icon, label }) => (
                  <li key={label} className="flex items-start gap-3">
                    <Icon weight="bold" className="mt-0.5 size-5 shrink-0 text-pink" aria-hidden />
                    <span className="leading-snug">{label}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-mono text-sm text-chalk">Para qué sirven</h3>
              <ul className="mt-5 flex flex-col gap-4">
                {spend.map((label) => (
                  <li key={label} className="leading-snug text-mute">
                    {label}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Reveal>

        {/* Premium */}
        <Reveal
          delay={0.08}
          className="relative isolate flex flex-col overflow-hidden bg-pink p-6 text-ink [--cut:24px] chamfer sm:p-10"
        >
          <div
            aria-hidden
            className="absolute -top-28 -right-28 -z-10 size-96 rotate-12 [background-image:repeating-linear-gradient(-45deg,var(--color-ink)_0_2px,transparent_2px_16px)] opacity-20"
          />
          <div className="flex items-center gap-3">
            <CrownIcon weight="fill" className="size-7" aria-hidden />
            <p className="font-mono text-xs tracking-[0.2em] uppercase">Premium</p>
          </div>
          <h2 className="mt-6 text-5xl display sm:text-6xl">Reglas nuevas. Segundas oportunidades.</h2>

          <ul className="mt-10 flex flex-col gap-6">
            {premium.map(({ icon: Icon, title, body }) => (
              <li key={title} className="flex gap-4">
                <span className="grid size-10 shrink-0 place-items-center bg-ink text-pink [--cut:7px] chamfer">
                  <Icon weight="bold" className="size-5" aria-hidden />
                </span>
                <div>
                  <p className="text-lg leading-snug font-bold">{title}</p>
                  <p className="mt-0.5 leading-relaxed text-ink/85">{body}</p>
                </div>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
