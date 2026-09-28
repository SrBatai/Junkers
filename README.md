# Squid League · Web

Landing page de **Squid League**: elige un equipo en cada jornada; si no gana, quedas eliminado. El último
superviviente se lleva el bote.

Dirección visual: plató de concurso televisivo en un estadio de noche (referencia estética: el tono de
_game show_ de THE FINALS). Tema oscuro, un único acento rosa, tipografía condensada de retransmisión y
esquinas achaflanadas.

## Stack

- **Next.js 16** (App Router, Turbopack, React 19, Server Components por defecto)
- **Tailwind CSS v4** (tokens en `app/globals.css` con `@theme`)
- **Motion** (`motion/react`) para animaciones, siempre respetando `prefers-reduced-motion`
- **Phosphor Icons**
- Fuentes con `next/font`: Archivo (eje de anchura variable) + Geist Mono

## Puesta en marcha

```bash
npm install
npm run dev        # http://localhost:3000
```

| Script              | Qué hace                            |
| ------------------- | ----------------------------------- |
| `npm run dev`       | Servidor de desarrollo              |
| `npm run build`     | Build de producción                 |
| `npm start`         | Sirve el build                      |
| `npm run lint`      | ESLint (config de Next)             |
| `npm run typecheck` | TypeScript sin emitir               |
| `npm run format`    | Prettier + orden de clases Tailwind |

## Variables de entorno

Copia `.env.example` a `.env.local`:

| Variable               | Uso                                                                                          |
| ---------------------- | -------------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_SITE_URL` | URL pública. Se usa en canonical, sitemap, robots y Open Graph.                              |
| `NEXT_PUBLIC_PLAY_URL` | Destino de todos los botones "Jugar gratis". Si está vacía, llevan a la demo (`#simulador`). |

## Estructura

```
app/
  layout.tsx            Fuentes, metadata SEO, viewport
  page.tsx              Composición de secciones + JSON-LD (WebSite y FAQPage)
  globals.css           Tokens de diseño, utilidades (display, chamfer, hazard)
  opengraph-image.tsx   Imagen social generada en build
  icon.svg, manifest.ts, robots.ts, sitemap.ts, not-found.tsx
components/
  sections/             Una sección de la landing por archivo
  jornada-simulator.tsx Demo jugable (cliente)
  hero-pick-card.tsx    Tarjeta animada del hero (cliente)
  site-header.tsx       Navegación fija + menú móvil (cliente)
  ui/                   Botones, escudos, logo, animación de entrada
lib/
  game.ts               Lógica pura del simulador (reducer + RNG inyectado)
  teams.ts              Equipos de la demo (ratings orientativos, no son datos reales)
  content.ts            Preguntas frecuentes
  site.ts               Nombre, URLs y navegación
```

## Sistema de diseño

- **Color**: fondo `ink` (#0a0a0c), texto `chalk`, secundario `mute`, acento único `pink` (#ff2d6b).
- **Forma**: sin `border-radius`. Superficies elevadas e interactivas usan la utilidad `chamfer`
  (corte en esquina superior derecha e inferior izquierda, tamaño con `[--cut:12px]`).
- **Tipografía**: titulares con la utilidad `display` (Archivo 900, anchura 62,5 %, mayúsculas).
  Números y marcadores en Geist Mono.
- **Capas (z-index)**: cabecera 40, menú móvil 50, grano 60.

## Imágenes

Las imágenes de `public/images/` (estadio, foco central y pistas) son ilustraciones generadas por
código, no fotografías. Para usar fotos reales, sustituye los archivos manteniendo nombre y proporción:

| Archivo           | Dónde se usa              | Proporción |
| ----------------- | ------------------------- | ---------- |
| `hero-arena.jpg`  | Hero                      | 4:5        |
| `spotlight.jpg`   | "Un único ganador"        | ~3:2       |
| `sport-*.jpg`     | Competiciones y deportes  | 4:5        |
| `final-arena.jpg` | CTA final e imagen social | 2:1        |

## Notas

- La demo y el ticker de resultados usan datos de ejemplo; no son resultados reales.
- Squid League no está afiliado a LaLiga, la Premier League ni a ningún club.
- Archivo se distribuye bajo SIL Open Font License (`assets/fonts/OFL.txt`).
