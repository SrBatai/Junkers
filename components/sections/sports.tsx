import Image from "next/image";
import {
  BasketballIcon,
  SoccerBallIcon,
  TennisBallIcon,
  VolleyballIcon,
} from "@phosphor-icons/react/dist/ssr";
import futbol from "@/public/images/sport-futbol.jpg";
import tenis from "@/public/images/sport-tenis.jpg";
import baloncesto from "@/public/images/sport-baloncesto.jpg";
import voleibol from "@/public/images/sport-voleibol.jpg";
import { Reveal } from "@/components/ui/reveal";

const sports = [
  {
    name: "Fútbol",
    icon: SoccerBallIcon,
    image: futbol,
    alt: "Campo de fútbol visto desde arriba bajo los focos",
    live: true,
    body: "LaLiga y Premier League, con más competiciones internacionales en camino.",
  },
  {
    name: "Tenis",
    icon: TennisBallIcon,
    image: tenis,
    alt: "Pista de tenis vista desde arriba",
    live: false,
  },
  {
    name: "Baloncesto",
    icon: BasketballIcon,
    image: baloncesto,
    alt: "Pista de baloncesto de parqué vista desde arriba",
    live: false,
  },
  {
    name: "Voleibol",
    icon: VolleyballIcon,
    image: voleibol,
    alt: "Pista de voleibol vista desde arriba",
    live: false,
  },
];

export function Sports() {
  return (
    <section id="deportes" className="py-20 lg:py-28">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-10">
        <Reveal className="max-w-3xl">
          <h2 className="text-5xl display sm:text-7xl lg:text-[5.5rem]">
            Empieza el fútbol.
            <br />
            <span className="text-pink">Después, todo.</span>
          </h2>
          <p className="mt-6 max-w-[36rem] text-lg leading-relaxed text-mute">
            Nacemos con las ligas más seguidas del mundo. Si hay competición, habrá Squid League.
          </p>
        </Reveal>

        <ul className="-mx-4 mt-14 no-scrollbar flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 sm:-mx-6 sm:px-6 md:mx-0 md:grid md:grid-cols-5 md:overflow-visible md:px-0">
          {sports.map((sport, i) => {
            const Icon = sport.icon;
            return (
              <Reveal
                as="li"
                key={sport.name}
                delay={i * 0.06}
                className={`w-[78%] shrink-0 snap-start sm:w-[45%] md:w-auto ${sport.live ? "md:col-span-2" : ""}`}
              >
                <div className="relative h-[22rem] overflow-hidden bg-ink-3 [--cut:20px] chamfer lg:h-[28rem]">
                  <Image
                    src={sport.image}
                    alt={sport.alt}
                    fill
                    placeholder="blur"
                    sizes="(min-width: 768px) 40vw, 80vw"
                    className={`object-cover transition-[filter] duration-500 ${sport.live ? "" : "grayscale-[0.6]"}`}
                  />
                </div>
                <div className="mt-5 flex items-center gap-3">
                  <Icon
                    weight="bold"
                    className={`size-6 ${sport.live ? "text-pink" : "text-mute"}`}
                    aria-hidden
                  />
                  <h3 className="text-3xl display">{sport.name}</h3>
                </div>
                <p className={`mt-2 font-mono text-xs ${sport.live ? "text-pink" : "text-mute"}`}>
                  {sport.live ? "Disponible" : "Próximamente"}
                </p>
                {sport.body && <p className="mt-3 max-w-[26rem] leading-relaxed text-mute">{sport.body}</p>}
              </Reveal>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
