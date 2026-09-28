export const site = {
  name: "Last Squad",
  title: "Last Squad | Elige, sobrevive, vence",
  description:
    "El juego de supervivencia para los esports de THE FINALS. Cada ronda eliges un equipo: si cae, caes con él. Sé el último en pie y llévate todo el bote.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  /** Target of every "Jugar gratis" CTA. Defaults to the in-site game. */
  playUrl: process.env.NEXT_PUBLIC_PLAY_URL || "/jugar",
  locale: "es_ES",
} as const;

export const nav = [
  { href: "/#como-funciona", label: "Cómo funciona" },
  { href: "/#simulador", label: "Pruébalo" },
  { href: "/#competiciones", label: "Competiciones" },
  { href: "/#premium", label: "Premium" },
  { href: "/#faq", label: "FAQ" },
] as const;
