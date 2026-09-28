import Image from "next/image";
import heroArena from "@/public/images/hero-arena.jpg";
import { HeroPickCard } from "@/components/hero-pick-card";
import { ButtonLink, PlayButton } from "@/components/ui/button";

const words = [
  { text: "Elige.", className: "" },
  { text: "Sobrevive.", className: "" },
  { text: "Vence.", className: "text-pink" },
];

export function Hero() {
  return (
    <section id="top" className="relative isolate overflow-hidden pt-16">
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(60%_50%_at_78%_40%,rgb(255_45_107/0.14),transparent_70%)]"
      />
      <div className="mx-auto grid min-h-[calc(100dvh-4rem)] max-w-[1400px] grid-cols-1 items-center gap-14 px-4 pt-8 pb-20 sm:px-6 lg:grid-cols-12 lg:gap-8 lg:px-10 lg:pt-10 lg:pb-16">
        <div className="lg:col-span-7">
          <p
            className="animate-rise font-mono text-xs tracking-[0.2em] text-mute uppercase"
            style={{ animationDelay: "0ms" }}
          >
            Modo Liga · LaLiga y Premier League
          </p>

          <h1 className="mt-6 text-[clamp(3.75rem,15vw,5rem)] display sm:text-[5.5rem] lg:text-[6.25rem] xl:text-[7.25rem]">
            {words.map((w, i) => (
              <span
                key={w.text}
                className={`block animate-rise ${w.className}`}
                style={{ animationDelay: `${120 + i * 110}ms` }}
              >
                {w.text}
              </span>
            ))}
          </h1>

          <p
            className="mt-7 max-w-[34rem] animate-rise text-lg leading-relaxed text-mute sm:text-xl"
            style={{ animationDelay: "480ms" }}
          >
            Cada jornada eliges un equipo. Si no gana, quedas eliminado. Sé el último en pie y llévate todo el
            bote.
          </p>

          <div
            className="mt-9 flex animate-rise flex-wrap items-center gap-3"
            style={{ animationDelay: "580ms" }}
          >
            <PlayButton />
            <ButtonLink href="#como-funciona" variant="secondary">
              Cómo funciona
            </ButtonLink>
          </div>
        </div>

        <div className="relative lg:col-span-5">
          <div className="relative aspect-[4/5] overflow-hidden bg-ink-3 [--cut:28px] chamfer sm:aspect-[5/5] lg:aspect-[4/5]">
            <Image
              src={heroArena}
              alt="Estadio de noche con los focos encendidos sobre el césped y los carteles LED en rosa"
              fill
              preload
              placeholder="blur"
              sizes="(min-width: 1024px) 40vw, 100vw"
              className="object-cover"
            />
            <div
              aria-hidden
              className="absolute inset-0 bg-gradient-to-t from-ink via-ink/10 to-transparent"
            />
          </div>
          <HeroPickCard className="absolute -bottom-10 left-4 w-[min(22rem,calc(100%-2rem))] sm:left-6 lg:-left-14" />
        </div>
      </div>
    </section>
  );
}
