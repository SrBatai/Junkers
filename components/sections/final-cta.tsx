import Image from "next/image";
import finalArena from "@/public/images/final-arena.jpg";
import { PlayButton } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";

export function FinalCta() {
  return (
    <section id="jugar" className="relative isolate overflow-hidden">
      <Image
        src={finalArena}
        alt=""
        fill
        placeholder="blur"
        sizes="100vw"
        className="-z-20 object-cover object-[50%_40%]"
      />
      <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-b from-ink via-ink/55 to-ink" />

      <div className="mx-auto flex min-h-[80dvh] max-w-[1400px] flex-col items-center justify-center px-4 py-28 text-center sm:px-6 lg:px-10">
        <Reveal>
          <h2 className="text-[clamp(3.5rem,13vw,10rem)] display">
            Una mala elección.
            <br />
            <span className="text-pink">Eliminado.</span>
          </h2>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="mx-auto mt-8 max-w-[30rem] text-xl leading-relaxed text-chalk/85">
            Sin vuelta atrás. ¿Llegas hasta el final?
          </p>
          <div className="mt-10 flex justify-center">
            <PlayButton size="lg" />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
