import type { Metadata } from "next";
import { LeagueGame } from "@/components/game/league-game";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "Jugar",
  description:
    "Crea tu liga de Last Squad, elige un equipo de THE FINALS en cada ronda y sobrevive a tus rivales hasta la Final Round.",
  alternates: { canonical: "/jugar" },
};

export default function PlayPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-[1400px] px-4 pt-24 pb-20 sm:px-6 lg:px-10 lg:pt-28">
        <LeagueGame />
        <p className="mt-6 text-sm text-dim">
          Resultados simulados con equipos que han competido en el circuito de THE FINALS. Tu liga se guarda
          en este navegador.
        </p>
      </main>
      <SiteFooter />
    </>
  );
}
