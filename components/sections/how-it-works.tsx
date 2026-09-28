import {
  CrosshairIcon,
  LockSimpleIcon,
  RankingIcon,
  SkullIcon,
  TrophyIcon,
  UsersThreeIcon,
} from "@phosphor-icons/react/dist/ssr";
import { Reveal } from "@/components/ui/reveal";

const rules = [
  {
    icon: UsersThreeIcon,
    title: "Únete o crea tu liga",
    body: "Con tus amigos o en una liga pública. Entrar es gratis.",
    tone: "base",
  },
  {
    icon: CrosshairIcon,
    title: "Elige un equipo",
    body: "Uno por ronda, de la competición que se está jugando.",
    tone: "base",
  },
  {
    icon: LockSimpleIcon,
    title: "Queda bloqueado",
    body: "No puedes repetirlo en todo el torneo. Guarda a los favoritos para cuando duela.",
    tone: "base",
  },
  {
    icon: RankingIcon,
    title: "En Cashout, top 2",
    body: "Partidas de cuatro equipos: el tuyo tiene que acabar entre los dos primeros.",
    tone: "base",
  },
  {
    icon: SkullIcon,
    title: "En Final Round, gana o fuera",
    body: "Cara a cara 3v3. Si tu equipo pierde, estás eliminado.",
    tone: "danger",
  },
  {
    icon: TrophyIcon,
    title: "El último se lo lleva todo",
    body: "Sobrevive a todos los demás y el bote es tuyo.",
    tone: "win",
  },
] as const;

const tones = {
  base: { card: "bg-ink-2", icon: "bg-white/[0.07] text-chalk", body: "text-mute" },
  danger: { card: "bg-pink-deep", icon: "bg-pink text-ink", body: "text-chalk/75" },
  win: { card: "bg-chalk text-ink", icon: "bg-ink text-pink", body: "text-ink/70" },
};

export function HowItWorks() {
  return (
    <section id="como-funciona" className="mx-auto max-w-[1400px] px-4 py-20 sm:px-6 lg:px-10 lg:py-28">
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-28">
            <Reveal>
              <h2 className="text-5xl display sm:text-7xl lg:text-[5.5rem]">
                Seis reglas.
                <br />
                <span className="text-pink">Una sola vida.</span>
              </h2>
              <p className="mt-6 max-w-[30rem] text-lg leading-relaxed text-mute">
                Varias rondas por delante y cada equipo disponible una sola vez. La estrategia empieza en la
                primera ronda, porque cada elección puede ser la última.
              </p>
            </Reveal>
          </div>
        </div>

        <ol className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:col-span-7">
          {rules.map((rule, i) => {
            const tone = tones[rule.tone];
            const Icon = rule.icon;
            return (
              <Reveal
                as="li"
                key={rule.title}
                delay={(i % 2) * 0.08}
                className={`flex min-h-56 flex-col justify-between p-6 [--cut:16px] chamfer sm:p-7 ${tone.card}`}
              >
                <span className={`grid size-12 place-items-center [--cut:8px] chamfer ${tone.icon}`}>
                  <Icon weight="bold" className="size-6" aria-hidden />
                </span>
                <div className="mt-10">
                  <h3 className="text-[1.7rem] leading-[0.95] font-extrabold uppercase [font-stretch:70%]">
                    {rule.title}
                  </h3>
                  <p className={`mt-3 leading-relaxed ${tone.body}`}>{rule.body}</p>
                </div>
              </Reveal>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
