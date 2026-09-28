export const site = {
  name: "Squid League",
  title: "Squid League | Elige, sobrevive, vence",
  description:
    "Elige un equipo en cada jornada. Si no gana, quedas eliminado. Sé el último superviviente y llévate todo el bote. Gratis, con LaLiga y la Premier League.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  /** Target of every "Jugar gratis" CTA. Falls back to the on-page demo. */
  playUrl: process.env.NEXT_PUBLIC_PLAY_URL || "#simulador",
  locale: "es_ES",
} as const;

export const nav = [
  { href: "#como-funciona", label: "Cómo funciona" },
  { href: "#simulador", label: "Pruébalo" },
  { href: "#deportes", label: "Competiciones" },
  { href: "#premium", label: "Premium" },
  { href: "#faq", label: "FAQ" },
] as const;
