import { Logo } from "@/components/ui/logo";
import { nav } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="border-t border-white/[0.07]">
      <div className="mx-auto grid max-w-[1400px] grid-cols-1 gap-10 px-4 py-14 sm:px-6 md:grid-cols-12 lg:px-10">
        <div className="md:col-span-5">
          <Logo />
          <p className="mt-5 max-w-[26rem] leading-relaxed text-mute">
            Elige un equipo. Si no gana, quedas eliminado. Sé el último y llévate todo el bote.
          </p>
        </div>

        <nav aria-label="Pie de página" className="md:col-span-7 md:justify-self-end">
          <ul className="grid grid-cols-2 gap-x-12 gap-y-3 sm:grid-cols-3">
            {nav.map((item) => (
              <li key={item.href}>
                <a href={item.href} className="text-mute transition-colors hover:text-chalk">
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex flex-col gap-3 border-t border-white/[0.07] pt-8 text-sm text-dim md:col-span-12 md:flex-row md:justify-between">
          <p>© {new Date().getFullYear()} Squid League. Gratis para jugar.</p>
          <p className="max-w-[40rem] md:text-right">
            Squid League es un juego independiente y no está afiliado a LaLiga, la Premier League ni a ningún
            club.
          </p>
        </div>
      </div>
    </footer>
  );
}
