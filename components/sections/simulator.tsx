import { JornadaSimulator } from "@/components/jornada-simulator";
import { Reveal } from "@/components/ui/reveal";

export function Simulator() {
  return (
    <section id="simulador" className="relative isolate py-20 lg:py-28">
      <div aria-hidden className="absolute inset-x-0 top-0 -z-10 h-2 hazard opacity-60" />
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-10">
        <Reveal className="max-w-3xl">
          <p className="font-mono text-xs tracking-[0.2em] text-pink uppercase">Demo interactiva</p>
          <h2 className="mt-5 text-5xl display sm:text-7xl lg:text-[5.5rem]">Prueba una liga</h2>
          <p className="mt-6 max-w-[36rem] text-lg leading-relaxed text-mute">
            Seis jornadas contra 23 rivales. Elige, confirma y descubre cuánto aguantas.
          </p>
        </Reveal>
        <Reveal className="mt-12" delay={0.1}>
          <JornadaSimulator />
        </Reveal>
      </div>
    </section>
  );
}
