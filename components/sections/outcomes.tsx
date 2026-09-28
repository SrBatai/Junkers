import Image from "next/image";
import { HandshakeIcon, SkullIcon, TrophyIcon } from "@phosphor-icons/react/dist/ssr";
import spotlight from "@/public/images/spotlight.jpg";
import { Reveal } from "@/components/ui/reveal";

export function Outcomes() {
  return (
    <section className="mx-auto max-w-[1400px] px-4 py-20 sm:px-6 lg:px-10 lg:py-28">
      <Reveal className="max-w-3xl">
        <h2 className="text-5xl display sm:text-7xl lg:text-[5.5rem]">
          Tres finales <span className="text-pink">posibles</span>
        </h2>
        <p className="mt-6 max-w-[34rem] text-lg leading-relaxed text-mute">
          Tú eliges. Las decisiones de todos los jugadores dan forma a cada liga.
        </p>
      </Reveal>

      <div className="mt-14 grid grid-cols-1 gap-3 lg:grid-cols-12 lg:grid-rows-2">
        <Reveal className="relative isolate overflow-hidden [--cut:28px] chamfer lg:col-span-7 lg:row-span-2">
          <div className="relative h-full min-h-[26rem] lg:min-h-[36rem]">
            <Image
              src={spotlight}
              alt="Un único foco ilumina el círculo central del campo"
              fill
              placeholder="blur"
              sizes="(min-width: 1024px) 58vw, 100vw"
              className="-z-10 object-cover"
            />
            <div
              aria-hidden
              className="absolute inset-0 -z-10 bg-gradient-to-t from-ink via-ink/40 to-transparent"
            />
            <div className="flex h-full flex-col justify-end p-6 sm:p-10">
              <TrophyIcon weight="bold" className="size-9 text-pink" aria-hidden />
              <h3 className="mt-5 text-[2.75rem] display sm:text-6xl">Un único ganador</h3>
              <p className="mt-4 max-w-[28rem] text-lg leading-relaxed text-chalk/80">
                Sobrevive a todos los demás y el bote es entero para ti.
              </p>
            </div>
          </div>
        </Reveal>

        <Reveal
          delay={0.08}
          className="relative flex flex-col justify-between gap-10 overflow-hidden bg-ink-2 p-6 [--cut:20px] chamfer sm:p-8 lg:col-span-5"
        >
          <div
            aria-hidden
            className="absolute -top-10 -right-10 size-56 [background-image:repeating-linear-gradient(-45deg,var(--color-chalk)_0_2px,transparent_2px_14px)] opacity-[0.18]"
          />
          <HandshakeIcon weight="bold" className="relative size-9 text-chalk" aria-hidden />
          <div className="relative">
            <h3 className="text-4xl display sm:text-5xl">Reparto del bote</h3>
            <p className="mt-3 max-w-[26rem] leading-relaxed text-mute">
              Si varios llegan vivos al final, el bote se reparte entre los supervivientes.
            </p>
          </div>
        </Reveal>

        <Reveal
          delay={0.16}
          className="relative flex flex-col justify-between gap-10 overflow-hidden bg-pink-deep p-6 [--cut:20px] chamfer sm:p-8 lg:col-span-5"
        >
          <div
            aria-hidden
            className="absolute inset-0 bg-[radial-gradient(80%_90%_at_100%_0%,rgb(255_45_107/0.45),transparent_60%)]"
          />
          <SkullIcon weight="bold" className="relative size-9 text-pink" aria-hidden />
          <div className="relative">
            <h3 className="text-4xl display sm:text-5xl">Todos eliminados</h3>
            <p className="mt-3 max-w-[26rem] leading-relaxed text-chalk/75">
              Una jornada imposible puede tumbar a todos a la vez. Entonces la liga no tiene ganador.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
