import Image from "next/image";
import {
  ArrowRightIcon,
  BroadcastIcon,
  GlobeHemisphereWestIcon,
  TrophyIcon,
} from "@phosphor-icons/react/dist/ssr";
import finalArena from "@/public/images/final-arena.jpg";
import { Reveal } from "@/components/ui/reveal";

const road = [
  {
    icon: BroadcastIcon,
    title: "Online Series",
    body: "Ciclos online por región. Los mejores del ranking consiguen invitación directa o plaza en los clasificatorios.",
  },
  {
    icon: GlobeHemisphereWestIcon,
    title: "Clasificatorios",
    body: "APAC, Américas y EMEA se juegan las últimas plazas a base de Cashouts y Final Rounds.",
  },
];

const facts = [
  { label: "Fechas", value: "27-29 nov 2026" },
  { label: "Equipos", value: "16" },
  { label: "Premios", value: "150.000 $" },
];

export function Competitions() {
  return (
    <section id="competiciones" className="py-20 lg:py-28">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-10">
        <Reveal className="max-w-3xl">
          <h2 className="text-5xl display sm:text-7xl lg:text-[5.5rem]">
            El circuito oficial.
            <br />
            <span className="text-pink">Ronda a ronda.</span>
          </h2>
          <p className="mt-6 max-w-[36rem] text-lg leading-relaxed text-mute">
            Last Squad sigue las competiciones oficiales de esports de THE FINALS. Esta temporada, todo lleva
            a Estocolmo.
          </p>
        </Reveal>

        <ol className="mt-14 grid grid-cols-1 gap-3 lg:grid-cols-[1fr_1fr_1.7fr]">
          {road.map(({ icon: Icon, title, body }, i) => (
            <Reveal
              as="li"
              key={title}
              delay={i * 0.08}
              className="relative flex flex-col justify-between gap-12 bg-ink-2 p-6 [--cut:20px] chamfer sm:p-8"
            >
              <div className="flex items-center justify-between">
                <Icon weight="bold" className="size-8 text-chalk" aria-hidden />
                <ArrowRightIcon
                  weight="bold"
                  className="size-5 rotate-90 text-pink lg:rotate-0"
                  aria-hidden
                />
              </div>
              <div>
                <h3 className="text-4xl display">{title}</h3>
                <p className="mt-3 leading-relaxed text-mute">{body}</p>
              </div>
            </Reveal>
          ))}

          <Reveal as="li" delay={0.16} className="relative isolate overflow-hidden [--cut:28px] chamfer">
            <Image
              src={finalArena}
              alt="Escenario de un gran torneo de esports con la pantalla LED encendida"
              fill
              placeholder="blur"
              sizes="(min-width: 1024px) 45vw, 100vw"
              className="-z-20 object-cover"
            />
            <div
              aria-hidden
              className="absolute inset-0 -z-10 bg-gradient-to-t from-ink via-ink/70 to-ink/20"
            />
            <div className="flex h-full min-h-[26rem] flex-col justify-end p-6 sm:p-8">
              <p className="font-mono text-xs text-pink">Próxima parada</p>
              <h3 className="mt-3 text-5xl display sm:text-6xl">The Grand Major 2026</h3>
              <p className="mt-3 text-lg text-chalk/85">DreamHack Estocolmo, Suecia</p>
              <dl className="mt-8 grid grid-cols-3 gap-4 border-t border-white/15 pt-5">
                {facts.map((f) => (
                  <div key={f.label}>
                    <dt className="text-xs text-mute">{f.label}</dt>
                    <dd className="mt-1 font-mono text-base font-semibold text-chalk sm:text-lg">
                      {f.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </Reveal>
        </ol>

        <Reveal className="mt-3 flex flex-col gap-4 bg-ink-2 p-6 [--cut:16px] chamfer sm:flex-row sm:items-center sm:p-8">
          <TrophyIcon weight="fill" className="size-9 shrink-0 text-pink" aria-hidden />
          <p className="text-lg leading-relaxed text-mute">
            <span className="font-semibold text-chalk">The Grand Major 2025.</span> NTMR ganó la primera
            edición en DreamHack Estocolmo, con 100.000 $ en premios.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
