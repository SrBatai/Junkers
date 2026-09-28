# Last Squad · Web

Landing page de **Last Squad**, un juego de supervivencia para los esports de **THE FINALS**: cada ronda
eliges un equipo; si cae, caes con él. El último superviviente se lleva el bote.

> Proyecto fan. Last Squad no está afiliado, patrocinado ni aprobado por Embark Studios. THE FINALS es una
> marca de Embark Studios AB y los nombres de los equipos pertenecen a sus respectivos dueños. La web no
> reproduce logos del juego ni de los equipos.

## Reglas del juego

- Cada ronda eliges **un equipo** de la competición en juego. Cada equipo solo se puede usar **una vez**.
- **Cashout** (4 equipos, 3v3v3v3): tu equipo tiene que acabar **entre los dos primeros**.
- **Final Round** (cara a cara, 3v3): tu equipo tiene que **ganar**.
- Si no, quedas eliminado. Desenlaces posibles: único ganador, reparto del bote o todos eliminados.

## Ligas con amigos (cuentas y base de datos)

- `/entrar`: crear cuenta o entrar (usuario y contraseña).
- `/ligas`: tus ligas, crear una o unirte con un código de 6 caracteres.
- `/ligas/unirse/CODIGO`: enlace de invitación para compartir.
- `/ligas/[id]`: la liga. El creador empieza la liga, juega cada ronda y abre la siguiente. Cada
  jugador elige su equipo (se puede cambiar hasta que se juega la ronda) y nadie ve los equipos de los
  demás hasta el resultado. Quien no elige a tiempo queda eliminado. Un reenganche por jugador y liga.
  La pantalla se refresca sola cada 6 segundos.

**Base de datos**: Supabase (proyecto OWPro), tablas con prefijo `ls_`. La migración está en
`supabase/migrations/`. No usa Supabase Auth, porque el trigger de `auth.users` de ese proyecto crearía
perfiles en la app OWPro. Last Squad tiene sus propias cuentas:

- Contraseñas con bcrypt (`pgcrypto`), sesiones con token aleatorio guardado como hash SHA-256 y cookie
  `httpOnly` de 30 días.
- Las tablas tienen RLS activado, sin políticas y sin permisos para `anon`/`authenticated`: todo pasa
  por funciones `ls_*` (`SECURITY DEFINER`) que validan sesión, pertenencia y propietario.
- Los resultados de cada ronda los simula el servidor de Next.js y los envía el creador de la liga; la
  base de datos comprueba que cuadran con las partidas y decide quién sobrevive. El creador, en teoría,
  podría enviar resultados a mano llamando a la API: es aceptable para ligas entre amigos.

Variables necesarias en `.env.local` (solo servidor):

```bash
SUPABASE_URL="https://awxdtfvcpmmzretesido.supabase.co"
SUPABASE_PUBLISHABLE_KEY="sb_publishable_..."   # clave publicable del proyecto
```

Sin esas variables la web y `/jugar` funcionan igual; `/entrar` avisa de que falta configurar la base de
datos.

## Competiciones que aparecen en la web

- **The Grand Major 2026**: DreamHack Estocolmo, 27-29 de noviembre de 2026, 16 equipos, 150.000 $.
- Su camino de clasificación: **Online Series** por regiones y **clasificatorios** de APAC, Américas y EMEA.
- **The Grand Major 2025**: ganado por NTMR (100.000 $ en premios).

La demo usa 16 equipos que han competido en el circuito (`lib/teams.ts`). **No** es la lista oficial del Grand
Major 2026 y los resultados son simulados. Actualiza los equipos cuando se cierren los clasificatorios.

## Stack

- **Next.js 16** (App Router, Turbopack, React 19, Server Components por defecto)
- **Tailwind CSS v4** (tokens en `app/globals.css` con `@theme`)
- **Motion** (`motion/react`) para animaciones, siempre respetando `prefers-reduced-motion`
- **Phosphor Icons**
- Fuentes con `next/font`: Archivo (eje de anchura variable) + Geist Mono

## Puesta en marcha

```bash
npm install
npm run dev        # http://localhost:3000        (web)
                   # http://localhost:3000/jugar  (juego completo)
```

En `/jugar` creas una liga (tu nombre, nombre de la liga y 7, 15 o 23 rivales) y juegas las seis
rondas contra jugadores simulados que eligen equipo cada ronda. La partida y tu perfil de puntos se
guardan en el navegador (`localStorage`).

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

| Variable               | Uso                                                                                     |
| ---------------------- | --------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_SITE_URL` | URL pública. Se usa en canonical, sitemap, robots y Open Graph.                         |
| `NEXT_PUBLIC_PLAY_URL` | Destino de todos los botones "Jugar gratis". Si está vacía, llevan al juego (`/jugar`). |

## Estructura

```
app/
  layout.tsx            Fuentes, metadata SEO, viewport
  page.tsx              Composición de secciones + JSON-LD (WebSite y FAQPage)
  jugar/page.tsx        Página del juego contra la máquina
  entrar/, ligas/       Cuentas y ligas con amigos
  globals.css           Tokens de diseño, utilidades (display, chamfer, hazard)
  opengraph-image.tsx   Imagen social generada en build
  icon.svg, manifest.ts, robots.ts, sitemap.ts, not-found.tsx
components/
  sections/             Una sección de la landing por archivo
  round-simulator.tsx   Demo de la portada: 5 Cashouts + 1 Final Round (cliente)
  game/board.tsx        Tablero compartido: partidas, marcador de rondas, contadores
  game/league-game.tsx  Juego completo de /jugar: liga, rivales, clasificación, historial
  hero-pick-card.tsx    Tarjeta animada del hero (cliente)
  site-header.tsx       Navegación fija + menú móvil (cliente)
  ui/                   Botones, etiquetas de equipo, logo, animación de entrada
lib/
  game.ts               Partidas, resultados y demo de la portada (RNG inyectado)
  league.ts             Motor de la liga completa: rivales, reenganche, desenlaces y puntos
  teams.ts              Equipos de la demo (ratings orientativos, no son datos reales)
  content.ts            Preguntas frecuentes
  format.ts             Formato de dinero y nombres de modos
  site.ts               Nombre, URLs y navegación
  friends.ts            Tipos y conversión de datos de las ligas con amigos
  actions.ts            Server Actions (cuentas, ligas, rondas)
  server/               Cliente de Supabase y sesión (solo servidor)
supabase/migrations/    SQL de las tablas y funciones ls_*
```

## Sistema de diseño

- **Color**: fondo `ink` (#0a0a0c), texto `chalk`, secundario `mute`, acento único `pink` (#ff2d6b).
- **Forma**: sin `border-radius`. Superficies elevadas e interactivas usan la utilidad `chamfer`
  (corte en esquina superior derecha e inferior izquierda, tamaño con `[--cut:12px]`).
- **Tipografía**: titulares con la utilidad `display` (Archivo 900, anchura 62,5 %, mayúsculas).
  Números y marcadores en Geist Mono.
- **Capas (z-index)**: cabecera 40, menú móvil 50, grano 60.

## Imágenes

Las imágenes de `public/images/` son ilustraciones generadas por código (escenario de esports y podio), no
fotografías ni capturas del juego. Para usar fotos propias, sustituye los archivos manteniendo nombre y
proporción:

| Archivo           | Dónde se usa                                   | Proporción |
| ----------------- | ---------------------------------------------- | ---------- |
| `hero-arena.jpg`  | Hero                                           | 4:5        |
| `spotlight.jpg`   | "Un único ganador"                             | ~3:2       |
| `final-arena.jpg` | The Grand Major 2026, CTA final, imagen social | 2:1        |

## Notas

- La demo, el ticker y la tarjeta del hero usan datos de ejemplo; no son resultados reales.
- Archivo se distribuye bajo SIL Open Font License (`assets/fonts/OFL.txt`).
