import {
  ArrowCounterClockwiseIcon,
  CoinsIcon,
  DevicesIcon,
  GiftIcon,
  LightningIcon,
  ShuffleIcon,
  TargetIcon,
  UserCircleIcon,
  UsersThreeIcon,
} from "@phosphor-icons/react/dist/ssr";
import { Reveal } from "@/components/ui/reveal";

const groups = [
  {
    name: "Para jugar",
    items: [
      { icon: GiftIcon, title: "Gratis para jugar y competir", body: "Sin compras obligatorias." },
      {
        icon: UsersThreeIcon,
        title: "Ligas con amigos o públicas",
        body: "Crea la tuya o únete a una abierta.",
      },
      { icon: LightningIcon, title: "Resultados en tiempo real", body: "Automáticos y sin retrasos." },
      {
        icon: TargetIcon,
        title: "Sin estadísticas complicadas",
        body: "Solo tú, la ronda y una decisión.",
      },
    ],
  },
  {
    name: "Para ganar",
    items: [
      {
        icon: CoinsIcon,
        title: "Sistema de puntos",
        body: "Gana ligas y torneos para desbloquear recompensas.",
      },
      {
        icon: ArrowCounterClockwiseIcon,
        title: "Reenganche",
        body: "Una segunda oportunidad cuando todo parece perdido.",
        premium: true,
      },
      {
        icon: ShuffleIcon,
        title: "Condiciones de victoria especiales",
        body: "Reglas únicas para partidas distintas.",
        premium: true,
      },
    ],
  },
  {
    name: "Para ti",
    items: [
      { icon: UserCircleIcon, title: "Avatares y perfil", body: "Personaliza cómo te ven tus rivales." },
      {
        icon: DevicesIcon,
        title: "Tu cuenta, sincronizada",
        body: "Elige en el móvil y revisa en el ordenador.",
      },
    ],
  },
];

export function Features() {
  return (
    <section className="mx-auto max-w-[1400px] px-4 py-20 sm:px-6 lg:px-10 lg:py-28">
      <Reveal className="max-w-4xl">
        <h2 className="text-5xl display sm:text-7xl lg:text-[5.5rem]">
          Pura estrategia.
          <br />
          <span className="text-mute">Cero complicaciones.</span>
        </h2>
      </Reveal>

      <div className="mt-16 grid grid-cols-1 gap-14 md:grid-cols-3 md:gap-8 lg:gap-12">
        {groups.map((group, gi) => (
          <Reveal key={group.name} delay={gi * 0.08}>
            <h3 className="border-t-2 border-pink pt-4 font-mono text-sm text-chalk">{group.name}</h3>
            <ul className="mt-8 flex flex-col gap-8">
              {group.items.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.title} className="flex gap-4">
                    <Icon weight="bold" className="mt-0.5 size-6 shrink-0 text-pink" aria-hidden />
                    <div>
                      <p className="text-lg leading-snug font-semibold text-chalk">
                        {item.title}
                        {"premium" in item && item.premium && (
                          <span className="ml-2 align-middle font-mono text-[11px] font-medium text-pink">
                            Premium
                          </span>
                        )}
                      </p>
                      <p className="mt-1 leading-relaxed text-mute">{item.body}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
