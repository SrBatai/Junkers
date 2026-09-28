import { Reveal } from "@/components/ui/reveal";

const lines = [
  { lead: "Si no te pierdes un Major de THE FINALS", rest: "y quieres jugarlo desde la grada." },
  { lead: "Si crees que sabes quién gana un Cashout", rest: "y quieres demostrarlo." },
  { lead: "Si te gusta la estrategia", rest: "y la tensión de cada decisión." },
  { lead: "Si quieres competir contra tus amigos", rest: "con partidas reales." },
];

export function Audience() {
  return (
    <section className="border-y border-white/[0.07] bg-ink-2">
      <div className="mx-auto max-w-[1400px] px-4 py-20 sm:px-6 lg:px-10 lg:py-28">
        <Reveal>
          <h2 className="text-5xl display sm:text-7xl lg:text-[5.5rem]">¿Para quién es?</h2>
        </Reveal>
        <ul className="mt-14 flex flex-col">
          {lines.map((line, i) => (
            <Reveal
              as="li"
              key={line.lead}
              delay={i * 0.06}
              className="group border-t border-white/[0.08] py-7 first:border-t-0 first:pt-0 lg:py-9"
            >
              <p className="max-w-5xl text-3xl leading-[1.08] font-extrabold tracking-[-0.01em] [font-stretch:80%] sm:text-4xl lg:text-5xl">
                <span className="text-chalk transition-colors duration-300 group-hover:text-pink">
                  {line.lead}
                </span>{" "}
                <span className="text-dim">{line.rest}</span>
              </p>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
