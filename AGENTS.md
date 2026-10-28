# AGENTS.md: portfolio julianRecarte

Portfolio en Astro con GSAP, Lenis, i18n (es/en/it) y ViewTransitions. Deploy en Vercel: `https://julianrecarte.dev/`.

Este archivo tiene **lo que hay que saber siempre**. El detalle está en `docs/`:

| Doc | Contenido |
|---|---|
| [docs/manual-de-marca.md](docs/manual-de-marca.md) | Identidad para humanos: esencia, voz, logo, color, tipografía, sí/no |
| [docs/marca.md](docs/marca.md) | Paleta, contraste, `Button`, líneas/sombras/radios, roles tipográficos, carga de fuentes |
| [docs/paginas.md](docs/paginas.md) | Anatomía y decisiones de Soluciones, `/sobre-mi`, SectionFade y case studies |
| [docs/seo.md](docs/seo.md) | `llms.txt`, robots, JSON-LD, CSP, headers, GA4 y links de contacto |

## Comandos

```bash
npm run dev       # http://localhost:4321/es/
npm run build     # salida en dist/
npm run preview   # sirve dist/
npm test          # Vitest + Happy DOM
npm run og        # regenera las imágenes OG (sharp, local)
```

## Estructura

```
src/
├── components/   # Componentes Astro (secciones y átomos; Button.astro = CTA único)
├── scripts/      # Módulos TS (GSAP, Lenis, interacciones) + *.test.ts
├── i18n/         # es.json · en.json · it.json + safe-t.ts
├── styles/       # globals.css (tokens, roles tipográficos, líneas)
├── assets/       # Imágenes (astro:assets)
├── layouts/      # Layout.astro (head, SEO, slots, scripts)
├── pages/        # index.astro (redirect) · [lang]/index · [lang]/sobre-mi · [lang]/proyectos/[slug]
└── data/         # projects.ts · process.ts · contact.ts · schema.ts
```

Alias: `@components/`, `@scripts/`, `@i18n/`, `@assets/`, `@layouts/`, `@styles/`, `@data/` → `src/<carpeta>/`.

**Home** (`[lang]/index.astro`): `Layout` con slot `nav` (Nav), slot `hero` (Hero + SectionFade) y, por defecto, Waves, Soluciones, Projects, AboutTeaser, Testimonials, Process, Contact y Footer. `/sobre-mi` y los case studies usan el mismo `Layout`.

## Convenciones

- **Ciclo de vida:** todo script interactivo se registra con `createLifecycle(name, init, destroy)` (`@scripts/lifecycle`). `astro:before-swap` llama a `destroy` y `astro:page-load` a `init`. El `name` deduplica: si el `<script>` se re-evalúa, el par nuevo reemplaza al anterior.
- **Animaciones:** siempre con `defineAnimation` (`@scripts/gsap-factory`), que crea un `gsap.context()` y lo mata en `destroy`. Con `prefers-reduced-motion` no arranca (ver Problemas conocidos).
- **Scroll:** suscribirse con `onScroll(cb)` (`@scripts/scroll-source`), que devuelve la función para desuscribirse. Hay una sola fuente (Lenis o scroll nativo).
- **i18n:** dos niveles (sección → clave). `safeT()` devuelve `""` ante una clave faltante en lugar de romper. El slug de las rutas es invariante por idioma, así que el selector de idioma solo cambia el prefijo.
- **Contacto:** `@data/contact.ts` es la única fuente del teléfono y el email (`waLink(msg)`, `mailtoLink(subject)`).
- **Marca** (detalle en `docs/marca.md`):
  - Solo cálidos; el violeta no existe.
  - Sin hex en componentes: usar clases o `theme()`.
  - Texto naranja: `text-accent-ink` (chico) o `text-accent-deep` (≥ 24px). Nunca `accent-orange` como texto.
  - CTA solo con `Button.astro` (`primary` / `accent` / `outline`).
  - Bordes: `line-hair` / `line-control`.
  - Contenedor de sección: `max-w-7xl mx-auto`.
- **Tipografía:**
  - Tamaños con los roles `.t-*` de `globals.css` (`t-h1`, `t-body`, `t-label`…), y color y peso con utilidades.
  - Al asignar un rol, quitar las utilidades de tamaño, interlineado y tracking, porque le ganan.
  - Secundario: `text-copy/70 dark:text-dark-muted`. `/60` no pasa AA.

## Hooks `data-*`

La API entre el HTML y el JS.

| Atributo | Módulo | Qué hace |
|---|---|---|
| `[data-reveal]` / `[data-reveal-stagger]` | reveal-observer.ts | Fade-in al entrar en viewport (stagger: cada hijo) |
| `[data-reveal-heading]` | cine-text.ts | Reveal por letra, agrupado por palabra |
| `[data-project-card]` / `[data-tilt]` + `[data-card-shine]` | card-tilt.ts | Tilt 3D y brillo con el mouse (cards de proyectos) |
| `[data-hero-text]` / `[data-hero-image]` / `[data-hero-orb]` | hero-scroll.ts | Salida del hero de la home al scrollear |
| `[data-zap-clone]` | hero-zap.ts | Glitch aleatorio en el rótulo del hero |
| `[data-wave]` | waves.ts | Morph de las olas + parallax |
| `[data-magnetic]` | magnetic.ts | Botón magnético (lo aplica `Button` por defecto) |
| `[data-process-step]` | animations.ts | Escala de las imágenes de Proceso |
| `[data-solu-line]` | soluciones-lines.ts | Separadores que se dibujan (`scaleX`), agrupados por sección |
| `[data-about-hero]` / `[data-about-portrait]` / `[data-about-wash]` | about-parallax.ts | Hero de /sobre-mi: el retrato (hoy no hay) baja, se achica y se atenúa; el wash deriva |
| `[data-about-reveal]` / `[data-about-stack]` / `[data-count-to]` | about-intro.ts | Aparición del retrato, velocidad del marquee y contadores |
| `[data-lang-chip]` | CSS (`:has()`) | Banderita de la tarjeta "Idiomas" de /sobre-mi |

Todos los módulos GSAP tienen `destroy` (`ctx.kill()`). Los de ScrollTrigger: hero-scroll, waves, animations, cine-text, soluciones-lines, about-parallax y about-intro (contadores).

## Problemas conocidos

### Movimiento reducido

- **La regla CSS no frena a GSAP.** `globals.css` acorta las animaciones y transiciones CSS, pero GSAP anima por rAF. El corte real está en `defineAnimation`, que no arranca con `prefers-reduced-motion`, así que los módulos no necesitan un guard propio. Solo `cine-text.ts` lo desactiva (`checkReducedMotion: false`), porque igual tiene que procesar el DOM.
- **Contenido invisible:** `[data-reveal]` arranca en `opacity: 0`. Todo módulo que salga temprano tiene que añadir `.revealed`, como ya hacen `reveal-observer.ts` y `cine-text.ts`.
- **Hero sticky:** con movimiento reducido `hero-scroll.ts` no corre, así que `globals.css` pasa `#hero` a `relative` y sus orbes de `fixed` a `absolute`. Si no, el hero queda clavado detrás de todas las secciones. Cualquier elemento `sticky`/`fixed` que dependa de GSAP para salir de pantalla necesita el mismo fallback.
- **Lenis:** con movimiento reducido no se crea. Un listener de scroll nativo alimenta `onScroll()` + `ScrollTrigger.update()`; sin él, "volver arriba" y el resaltado del nav se congelan.

### `backdrop-filter` del nav

Chrome deja de desenfocar lo que pasa por detrás si:
- Una animación termina en `filter: blur(0px)`: usar siempre `filter: "none"`.
- Hay `will-change` permanente en texto que pasa bajo el nav.
- Un ancestro usa `overflow-x: hidden`: usar `clip`.
- Lenis aplica `transform` al wrapper: los fijos llevan `data-lenis-prevent`.

### Texto y CSS

- **cine-text en dos pasadas:** primero envuelve las letras de todos los títulos y después crea las animaciones. Si se intercalan, cada ScrollTrigger fuerza un reflow y el init pasa de ~60 a ~160 ms en desktop (la tarea más larga del TBT mobile). Aplica a cualquier módulo nuevo que toque el DOM y cree ScrollTriggers.
- **cine-text:** las letras van dentro de `.cine-word` (`inline-block` + `nowrap`) y los espacios quedan como texto. Si no, el título se parte en cualquier letra ("FULLSTAC / K"). No arreglarlo con `<br>` ni con `text-wrap`.
- **Nada de `bg-clip-text` + `text-transparent` sobre colores que son variables** (`accent-ink`/`deep`): Chrome no repinta al cambiar de tema y el texto queda invisible pero seleccionable.
- **`accent-ink`/`deep` son variables:** no aceptan modificador de opacidad (`/80` no genera nada).
- **Hero en mobile:** mide `min-h-svh` (no `dvh`) para no cambiar de alto cuando el navegador esconde la barra de direcciones. Su fade (`hero-scroll.ts`) es corto, con `scrub: true` y `ease: "power2.out"`, porque ese primer tramo del gesto no mueve `scrollY`: con un fade lineal y largo se sentía "el hero sube y después se desvanece".
- **GSAP pisa el `translate` de Tailwind:** si un elemento se centra con `-translate-*`, las animaciones van en una capa interna.

### Build y fuentes

- **`manualChunks` como función**, no como objeto: Astro compara ids absolutos y la forma objeto nunca matchea.
- **Fuentes self-hosted** en `public/fonts/` (`@font-face` en `globals.css`). Nada de CSS de Fontshare/Google Fonts: bloqueaba el render en mobile. Satoshi no tiene 600. Detalle en `docs/marca.md`.
- **El JS pesado va fuera del camino crítico:** `@scripts/main` (GSAP + Lenis) se importa con `import()` después del primer frame (`Layout.astro`), y `gtag.js` se inyecta tras el `load`.
- **`initAll` es async y cede el hilo entre módulo y módulo** (`scheduler.yield` / `setTimeout`). Como corre después del primer pintado, cae dentro de la ventana del TBT: en una sola tarea llegaba a ~740 ms en mobile y bajaba desktop de 97 a 85. Un módulo nuevo se suma como un paso más de `steps`, nunca como un bloque sincrónico grande. `destroyAll` corta un init a medio camino (contador `run`). No importar `gsap`/`lenis` de forma estática desde un `<script>` de componente: volvería al bundle inicial y retrasaría el LCP.
- **CSS inline** (`build.inlineStylesheets: "always"`): evita el round-trip de los `<link>` bloqueantes.
- **Imagen del hero:** `srcset` + `sizes` compartidos entre `<Image>` y el preload vía `@data/hero-image.ts`. Si cambia el tamaño o el `scale-*` del retrato, actualizar ahí. La foto pasa al costado desde `min-[900px]` (no `xl`): apilada, en un plegable o iPad en horizontal los CTA quedaban bajo el pliegue. Ese corte también está en los `sizes`/`media` de ese archivo.
- **CSP con hashes:** el bootstrap de dark mode y el redirect de `/` son los únicos scripts inline. Si se tocan, el hash deja de valer y el script se bloquea en silencio. Hay que recalcularlo (`docs/seo.md`).

## Accesibilidad

- Targets táctiles ≥ 44px. Los puntos de los carruseles son `w-11 h-11 p-4` + `bg-clip-content`.
- Carruseles: `aria-current` en los puntos. Las tarjetas no activas de Testimonios llevan `inert` + `aria-hidden`, y se navega con ← →.
- Contraste AA en ambos temas (tabla en `docs/marca.md`). `dark.muted` = `#A8A8A8`.
- Lo decorativo va `aria-hidden`, con su texto real en `sr-only` (stack de /sobre-mi).
