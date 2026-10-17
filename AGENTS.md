# Architecture Guide — julianRecarte portfolio

## Project Overview

Single-page Astro portfolio with GSAP animations, Lenis smooth scrolling, i18n (es/en/it), and ViewTransitions. Deployed to Vercel at `https://julianrecarte.dev/`.

## Folder Structure

```
src/
├── components/    # Astro components (pages, sections, atoms)
├── scripts/       # Vanilla JS modules (GSAP, Lenis, interactions)
├── i18n/          # Translation JSON files (es.json, en.json, it.json)
├── styles/        # Global CSS (Tailwind + custom properties)
├── assets/        # Static images (processed by astro:assets)
├── layouts/       # Layout shell (head, SEO, slots)
├── pages/         # Routes ([lang]/index.astro, index.astro redirect)
└── data/          # Extracted data (projects, process steps)
```

## Path Aliases

```typescript
@components/  → src/components/
@scripts/     → src/scripts/
@i18n/        → src/i18n/
@assets/      → src/assets/
@layouts/     → src/layouts/
@styles/      → src/styles/
@data/        → src/data/
```

## Architecture Patterns

### Component Tree

```
[lang]/index.astro (page orchestrator)
├── Layout.astro (shell: head, slots, scripts)
│   ├── slot "nav"  → Nav.astro + nav.js
│   ├── slot "hero" → Hero.astro + SectionFade (bottom)
│   └── slot default → Waves, Soluciones (+SectionFade top), Projects, AboutTeaser, Testimonials, Process, Contact, Footer
├── CaseStudy.astro (en [lang]/proyectos/[slug].astro)
├── sobre-mi.astro (en [lang]/) — página "Sobre mí": hero con retrato + firma, banda de stack, datos y FAQ
└── SectionFade.astro (reutilizable, token --section-fade-h)
```

### Script Lifecycle (ViewTransitions)

Every interactive script uses `createLifecycle(name, init, destroy)` from `@scripts/lifecycle.js`:

```js
// In Layout.astro <script>:
import { initAll, destroyAll } from "@scripts/main.js";
import { createLifecycle } from "@scripts/lifecycle.js";
createLifecycle("main", initAll, destroyAll);

// In Nav.astro <script> (mismo registro, listeners únicos):
createLifecycle("nav", initNav, destroyNav);
```

- `astro:before-swap` → calls `destroy()` (clean listeners, kill GSAP contexts)
- `astro:page-load` → calls `init()` (re-attach listeners, re-create animations)
- `name` deduplica: un solo par de listeners para todos los componentes; si el `<script>` se re-evalúa tras una navegación, el par nuevo reemplaza al anterior en vez de sumarse (evita N× `init`).

### Shared Scroll Utility

`@scripts/scroll-source.ts` exports `onScroll(callback)` — subscribers notified from Lenis scroll. Multiple modules subscribe, one source runs. Each call returns an unsubscribe function.

```ts
import { onScroll } from "@scripts/scroll-source";
const cleanup = onScroll((scroll, velocity, direction) => { /* ... */ });
// later: cleanup()
```

### Language Switching

`LangSelector.astro` renders language codes `ES/EN/IT` (no flags, per W3C — flags = countries, not languages) in two instances `desktop`/`overlay` (`LangSelector.astro:22`, `Nav.astro:89`). Dropdown `72px` (`--dd-min-w`, `LangSelector.astro:73,93`) with `scaleY` transition, `Nav.astro:89` inner `overflow-visible` to avoid clipping on mobile. `nav.ts` handles dropdown toggle and navigates via `window.location.pathname` rewrite (full page reload with ViewTransitions slide).

## The `data-*` Hook System

Components use `data-*` attributes as hooks between HTML and JS. These are the "API" between presentation and interactivity:

| Attribute | Used By | Purpose |
|-----------|---------|---------|
| `[data-reveal]` | reveal-observer.ts | Fade-in on scroll (IntersectionObserver) |
| `[data-reveal-heading]` | cine-text.ts | Character-level stagger reveal |
| `[data-reveal-stagger]` | reveal-observer.ts | Observe each child individually |
| `[data-project-card]` | card-tilt.ts | 3D tilt on mouse hover |
| `[data-card-shine]` | card-tilt.ts | Radial gradient shine overlay |
| `[data-hero-text]` | hero-scroll.ts | Fade-out + slide on scroll |
| `[data-hero-image]` | hero-scroll.ts | Scale-down on scroll |
| `[data-hero-orb]` | hero-scroll.ts | Decorative orbs fade-out |
| `[data-zap-clone]` | hero-zap.ts | Random glitch flash effect |
| `[data-wave]` | waves.ts | SVG path morph + scroll parallax depth |
| `[data-magnetic]` | magnetic.ts | Magnetic button hover (Hero CTAs, Contact links) |
| `[data-process-step]` | animations.ts | Process image scale on scroll |
| `[data-solu-line]` | soluciones-lines.ts | Separator line draw (scaleX) for Soluciones |
| `[data-about-hero]` | about-parallax.ts | Scroll trigger del hero de `/sobre-mi/` |
| `[data-about-portrait]` | about-parallax.ts | Retrato: deriva +32px al scrollear (parallax) |
| `[data-about-wash]` | about-parallax.ts | Wash del hero: deriva −32px (parallax opuesto) |

## Known Pitfalls

### prefers-reduced-motion deja el contenido invisible

`[data-reveal]` / `[data-reveal-stagger]` arrancan en `opacity: 0` (`globals.css`) y solo se ven cuando JS añade `.revealed`. Si un módulo sale temprano con `prefers-reduced-motion` **sin** añadir la clase, el contenido queda invisible para siempre (el `globals.css` reduced-motion solo acorta la animación, no cambia la opacidad).

**Fix:** `reveal-observer.ts` añade `.revealed` a todos los items cuando hay movimiento reducido (contenido visible, sin animación). `cine-text.ts` ya lo hacía bien.

### La regla CSS de reduced-motion no frena a GSAP

`globals.css` neutraliza animaciones y transiciones **CSS** (`animation-duration: 0.01ms; animation-iteration-count: 1`), pero GSAP anima por rAF: sus tweens siguen corriendo igual. El corte real está en JS:

| Módulo | Con movimiento reducido |
|--------|------------------------|
| Cualquier módulo de `defineAnimation` | No arranca: la fábrica retorna en `gsap-factory.ts:19` **antes** de crear el context. No hace falta un guard propio |
| `lenis-adapter.ts` | No se crea Lenis. Un listener de scroll nativo alimenta `onScroll()` + `ScrollTrigger.update()` (sin él, "volver arriba" y el resaltado del nav se quedan congelados) y `scrollToTop` salta en seco |
| `reveal-observer.ts` | Añade `.revealed` sin animar (si no, `[data-reveal]` queda invisible) |
| `cine-text.ts` | Procesa el DOM y añade `.revealed`, sin tweens |
| Banda de stack de `/sobre-mi/` (CSS puro) | La animación CSS se acorta a 0.01ms y vuelve al estado inicial (`translateX(0)`) → queda el primer tramo fijo |

## Accesibilidad

- **Targets táctiles ≥ 44px** — `.lang-btn` y `.lang-option` (`min-h-[44px]`), flechas de Testimonios y redes del Footer (`w-11 h-11`, eran 40px). Los puntos de los dos carruseles son `w-11 h-11 p-4` + `bg-clip-content`: con el `box-sizing: border-box` de Preflight, el `w-3 h-3 p-4` anterior los dejaba en **12px** (el padding se recortaba y el punto casi no se veía).
- **Carruseles** — los puntos exponen `aria-current`. Testimonios: `tabindex="0"` en el contenedor, navegación con ← → (listener en `#testimonios`, así funciona también con el foco en los puntos) y `inert` + `aria-hidden` en las tarjetas no activas — sin eso, Tab y el lector de pantalla recorrían testimonios invisibles. Proyectos ya es un scroll horizontal nativo con `tabindex="0"` (teclado gratis) y sus puntos son `md:hidden`.
- **Contraste AA en ambos temas** — `dark.muted` subió de `#888888` (4.9:1) a `#A8A8A8` (7.3:1) sobre `#1C1A18`.

### manualChunks en Astro va como función, no como objeto

Astro intercepta `output.manualChunks` comparando el `id` **absoluto** del módulo (`node_modules/astro/dist/core/build/plugins/util.js`), así que la forma objeto (`{ gsap: ["gsap"] }`) no matchea nunca. Usar la forma de función:

```js
manualChunks(id) {
  if (id.includes("node_modules/gsap")) return "gsap";
  if (id.includes("node_modules/lenis")) return "lenis";
}
```


### Google Fonts: un eje fuera de rango devuelve 400 (la fuente no carga, en silencio)

Si un eje del `css2` está fuera del rango real de la familia, Google responde **HTTP 400** y **no llega ningún `@font-face`** → el navegador cae al fallback sin error visible fuera de DevTools › Network.

- **Outfit** (`h1`–`h6`): único eje `wght 100..900`; el sitio pide `wght@500..700`. URL: `family=Outfit:wght@500..700&display=swap`.
- Verificar siempre: `curl -s -o /dev/null -w "%{http_code}\n" "<url>"` → debe dar **200**.
- Rangos oficiales: `https://fonts.google.com/metadata/fonts` (campo `axes` de cada familia).
- Stack del sitio: **Satoshi** (body/UI, Fontshare) + **Outfit** (`h1`–`h6`, Google Fonts; variable `font-weight: 100 900`, ~15 KB woff2, sin eje de ancho).
- **Peticiones exactas** (nada que no se use):
  - Satoshi: `f[]=satoshi@400,500,400i` (Fontshare tiene **3 pesos: 400/500/700** y **no tiene 600**).
  - Outfit: `wght@500..700` (500 títulos, 700 solo los H3 con gradiente).

### Fontshare: las itálicas van con el sufijo `i`, y no existe el 600

- La sintaxis de Fontshare **no** es la de Google. Para itálicas reales hay que sufijar el peso con `i`: `f[]=satoshi@400,500,400i` (3 caras, 1 itálica). Alternativas que **no** funcionan: `@1,400,500,700` (0 itálicas), `@2,400` (devuelve 1 cara pero no es itálica).
- **Satoshi no declara 600**: `font-semibold` se resolvía como 700 (falsa negrita). El sistema quedó en **400 = texto, 500 = énfasis, 700 = solo títulos con gradiente** (esos son Outfit, no Satoshi). Si aparece un `<strong>` o un 600 nuevo, hay que añadirlo a la URL — hoy renderiza sintético.
- Antes de tocar la URL: `curl -s "<url>" | grep -c "@font-face"` y `grep -c "font-style: italic"`.

### Sistema tipográfico: roles en `globals.css`

La escala vive en `src/styles/globals.css` como **tokens** (`--fs-*`, `--lh-*`, `--tr-*`) + **15 clases de rol** dentro de `@layer components`. Un rol fija **tamaño + interlineado + tracking (+ uppercase)**; el **color y el peso quedan siempre en utilidades** de Tailwind.

| Rol | Uso | Móvil → `md:` |
|---|---|---|
| `.t-eyebrow` | Label sobre un título de sección | 14px, 500, `.3em`, uppercase |
| `.t-index` | Contador editorial (01, 02) | 12px, 500, `.22em`, tabular |
| `.t-h1` | Título de página (Hero, `/sobre-mi`) | 2.5rem → 3rem → `lg:` 3.75rem |
| `.t-h2` | Título de sección y de página interior | 2.25rem → 3rem |
| `.t-h3` | Título de ítem (card, servicio) y H1 del case study | 1.5rem → 1.875rem |
| `.t-h4` | Título chico (autor, paso) | 1.125rem → 1.25rem |
| `.t-feature` | Título de panel (timeline de Proceso) | 1.875rem → 2.25rem |
| `.t-lead` | Párrafo de entrada | 1.125rem → 1.25rem |
| `.t-body` | Párrafo descriptivo | 0.875rem → 1rem |
| `.t-body-lg` | Párrafo largo / cita / subtítulo | 1rem → 1.125rem |
| `.t-meta` | Texto secundario | 0.875rem |
| `.t-label` | Label de botón / pill | 0.875rem → 1rem, 500, `.05em`, uppercase |
| `.t-badge` | Badge de estado | 0.75rem, 500, `.05em`, uppercase |
| `.t-link` | Link de nav / footer | 0.875rem, `.1em`, uppercase |
| `.t-link-quiet` | Link dentro de contenido (volver, caso de estudio) | 0.875rem, `.05em`, uppercase |

**Reglas de color** (utilidades, solo 3 valores + primario):

| Tono | Clase | Uso |
|---|---|---|
| Primario | `text-copy dark:text-dark-copy` | títulos, valores |
| Secundario | `text-copy/70 dark:text-dark-muted` | body, lead, meta, citas |
| Link/UI | `text-copy/80 dark:text-dark-copy` | nav, footer, contacto |
| Decorativo | `text-copy/30 dark:text-dark-muted/40` | índices `aria-hidden` |

- `/70` en claro ≈ 5.5:1 y `dark-muted` en oscuro ≈ 4.9:1 → **AA en ambos temas**. Un `/60` en claro da 4.0:1 (falla AA); no usar.
- **El H1 del case study no puede crecer**: su columna de texto mide ~276px a 1024px de ancho (grid `lg:grid-cols-[1fr_660px]`, columna de mockup fija en 660px) y "Multiservizi" a 3rem ocupa ~300px → desborda. Por eso queda en `.t-h3` (su tamaño histórico). Para subirlo hay que **ensanchar la columna** (o rearmar el hero en dos filas), no cambiar el rol. Ya **no** es un problema de alto: la página scrollea (ver *Case study — layout*).
- Los roles van en `@layer components`, así que **cualquier utilidad de Tailwind los sobrescribe**. Si un elemento conserva un `md:text-lg` suelto, esa utilidad gana y el rol queda muerto: al asignar un rol hay que **quitar** sus utilidades de tamaño/interlineado/tracking.
- `h1`–`h6` llevan `font-weight: 500` + `line-height: var(--lh-heading)` (1.25) como red de seguridad en `globals.css`; los headings sin `leading-*` ya no heredan el 1.6 del body.
- Los `font-bold` que quedan son **solo** los dos H3 con gradiente (Outfit 700). Todo lo demás es 500.

### backdrop-filter won't blur GSAP-animated text

**Root cause:** GSAP's `fromTo` targeting `filter: "blur(0px)"` creates GPU layers. `blur(0px)` ≠ `none` — any non-none filter value creates a stacking context and promotes to GPU layer. Chrome's `backdrop-filter` cannot sample across GPU-composited layers.

**Fix:** Always use `filter: "none"` as the end state of blur animations, never `blur(0px)`.

```diff
- { filter: "blur(0px)" }  // creates stacking context on every char
+ { filter: "none" }       // no stacking context, backdrop-filter works
```

### Lenis + position:fixed + backdrop-filter

Lenis wraps body content in a div with `transform: matrix3d()`. An ancestor with `transform` becomes the containing block for `position: fixed`, re-anchoring `backdrop-filter` to the Lenis wrapper instead of the viewport.

**Fix:** Add `data-lenis-prevent` to fixed elements that need backdrop-filter.

```html
<nav id="main-nav" data-lenis-prevent>...</nav>
```

### overflow-x: hidden breaks backdrop-filter on fixed children

`overflow: hidden` (not `clip`) creates a scroll container. In Chrome, a scroll container ancestor of `position: fixed` re-anchors the backdrop-filter root.

**Fix:** Use `overflow-x: clip` instead (supported Chrome 90+, Firefox 81+, Safari 16+).

### will-change creates GPU layers invisible to backdrop-filter

Elements with `will-change: transform/opacity/filter` get promoted to GPU layers that `backdrop-filter` can't see through. Avoid `will-change` on text content that passes behind the navbar.

## GSAP Animation Modules

| Module | What it animates | Uses ScrollTrigger? | Has destroy? |
|--------|-----------------|---------------------|--------------|
| `hero-scroll.ts` | Hero text/image/orbs exit | Yes (scrub) | Yes |
| `hero-zap.ts` | Glitch flash on hero label | No (time-based) | Yes |
| `waves.ts` | SVG path morph + scroll parallax | Yes (scrub) + loop | Yes |
| `animations.ts` | Progress bar, process line, step images | Yes | Yes |
| `card-tilt.ts` | 3D card tilt + shine | No (mouse-based) | Yes |
| `magnetic.ts` | Magnetic hover on CTAs / contact links | No (mouse-based) | Yes |
| `cine-text.ts` | Character stagger reveal | Yes | Yes |
| `soluciones-lines.ts` | Soluciones separator draw | Yes | Yes |
| `about-parallax.ts` | Retrato + wash de `/sobre-mi/` | Yes (scrub) | Yes |

All modules use `defineAnimation` / `gsap.context()` for scoped cleanup. `destroy()` calls `ctx.kill()`.

**`defineAnimation` ya corta todo con `prefers-reduced-motion`** (`checkReducedMotion`, default `true`): los módulos no necesitan su propio guard. Solo `cine-text.ts` lo desactiva (`{ checkReducedMotion: false }`) porque necesita procesar el DOM y añadir `.revealed` sin animar. `lenis-adapter.js` y `reveal-observer.ts` no pasan por la fábrica y se gatean solos.

## i18n

Three languages in `src/i18n/`. The `safeT()` Proxy in `[lang]/index.astro` returns `""` for missing keys instead of crashing. Translation structure is two-level (section → keys).

## Navbar Glassmorphism

```css
#main-nav {
  background-color: color-mix(in srgb, var(--bg-hex) 95%, transparent);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  transition: transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}
```

Simple approach: beige at 95% opacity + minimal blur. No saturate, no separate scrolled state. Transition only on transform for show/hide animations.

## Soluciones — Sección editorial

Ubicada entre Hero y Projects (`[lang]/index.astro:33`). Sin cards (intencional) para no repetir `ProjectCard`/`Testimonials`.

- **Layout:** lista editorial `grid-cols-[300px_1fr]` con separadores `h-px bg-black/[0.08]` animados vía `[data-solu-line]` (`soluciones-lines.ts` scaleX 0→1 0.6s stagger 0.08). Contenedor `max-w-7xl` (alineado con resto, no `5xl`). Título `Elegí por dónde / empezar` (it/en: `Scegli da dove / iniziare`, `Choose where / to start`), hint central `italic text-wrap: balance` + CTA único `w-auto px-6 py-3 md:px-8 md:py-4 bg-gradient-to-r from-accent-orange to-accent-pastel backdrop-blur-lg` (mismo que Hero primario).
- **IDs:** `soluciones` (nav anchor), nav `IntersectionObserver` en `nav.ts` incluye `soluciones`.
- **i18n:** `soluciones { label, title, highlight, hint, cta, items[3] }` en `es/en/it.json`.

## Página /sobre-mi — Retrato editorial

`src/pages/[lang]/sobre-mi.astro` (slug invariante `sobre-mi` → el `switchLang` conserva el path). Solo su propio contenido: **una página de "sobre mí", para navegar la web se vuelve a la home**.

- **Qué NO tiene** (a propósito): **Servicios** (leía `t.soluciones.items`), **Proceso** (leía `t.process.steps`) y `<Contact />` — duplicaban el home, y la FAQ ya cubre los servicios. Sin `<Contact />` tampoco existe `#contacto`, así que el `IntersectionObserver` del nav no puede robarle el `active` a "Sobre mí" (`nav.ts` lo marca por ruta cuando `pathname` incluye `/sobre-mi`).
- **Hero** a dos columnas (`lg:grid-cols-[1fr_340px]`, mobile apilado): eyebrow outlined (`label-outline`) + H1 `.t-h1` (`data-reveal-heading`) + intro, y el **retrato** con `aspect-[2/3]` + `scale-[1.04] translate-y-[2%]`. La foto es otra que la del home (**`sobreMi.webp`**, él sentado con las piernas dobladas; el home sigue con `yo.webp`), así que el encuadre es propio y **no** se toca al cambiar el del Hero: el sujeto de `sobreMi.webp` está pegado al borde superior del archivo, y la regla `translate = (scale−1)/2` (2% con `scale 1.04`) **alinea el borde superior del archivo con el borde superior de la tarjeta** → entra la figura entera (96% del alto, 85% del ancho; la cara queda ~128px en la tarjeta de 340px). Subir cualquiera de los dos valores recorta el pelo.
- **Fondo del retrato** — tarjeta "papel": `bg-[var(--bg-hex)] dark:bg-dark-card` (se adapta al tema) + un **glow cálido** en el pie (`w-[130%] h-[55%]` redondeado `bg-accent-warm/25 blur-3xl`, recortado por el `overflow-hidden` y visible a través del cutout) + el anillo de 2px como **hairline** (`bg-black/[0.08] dark:bg-dark-muted/25`). Antes era un degradé naranja de esquina a esquina. El glow va **antes** que la `<Image>` y ésta lleva `relative` (si no, el absoluto taparía la foto).
- **Firma** — `firma.png` en un pill `bg-[var(--bg-hex)] dark:bg-dark-card` con `-bottom-6`, **dentro** del marco del retrato (`data-about-portrait`) para que el parallax mueva los dos juntos. `.signature` (brightness(0) + invert en oscuro) vive en `globals.css`, compartido con el Footer.
- **Banda de stack** — ticker CSS puro entre el hero y los datos: `aria-hidden` en el track + `<ul class="sr-only">` con la lista real (accesible e indexable). 2 grupos idénticos de `about.stack` ×2 y `translateX(-50%)` → loop sin salto (el espaciado va como `px-5` en cada `<li>`, **no** como `gap`, o el −50% no coincide). `mask-image` desvanece los bordes. Sin JS: con movimiento reducido la regla de `globals.css` la deja en `translateX(0)`.
- **Wash** del hero — dos focos `radial-gradient` con `color-mix` (naranja + pastel, solo cálidos: el morado sobre beige ensuciaba). Se mueve con el parallax.
- **Datos** — `about.facts` en grilla `md:grid-cols-2` (4 items → 2×2 balanceada), cada uno con `.t-index` + `label`/`value` y `border-t`.
- **FAQ** — `SectionHeader` + `<details>` numerados dentro de `[data-reveal-stagger]`.
- **Cierre** — hairline + pill "Volver al inicio" con `[data-magnetic]`.
- **Anims** — `about-parallax.ts` (`[data-about-hero/portrait/wash]`, scrub) + los reveals existentes. Nada nuevo de GSAP.
- **i18n:** `about { label, title, highlight, intro, metaDescription, teaser*, cta, factsLabel, facts[4], stack[6], faq*, backHome }`. Ya **no** existen `servicesTitle`, `processTitle`, `ctaTitle` ni `ctaBody`.

## SectionFade — Sistema de transición

Token `--section-fade-h: 128px` en `globals.css:25`. Componente `SectionFade.astro` (`edge="top"|"bottom"`) con curva ease de 7 paradas `color-mix(in srgb, var(--bg-hex) X%, transparent)` para fundido imperceptible. Doble fundido: `Hero bottom` (dentro, `bottom:0`) + `Soluciones top` (fuera, `top: calc(-1*var)`). Solo para sticky hero, no se extiende a otras secciones.

Simple approach: beige at 95% opacity + minimal blur. No saturate, no separate scrolled state. Transition only on transform for show/hide animations.

## Analytics

- `@vercel/speed-insights` se inyecta en el `<head>` de `Layout.astro` mediante el componente `<SpeedInsights />`. No requiere configuración adicional — Vercel recolecta los datos automáticamente.
- **GA4 (`G-R1ZPHT8LX2`)** — el snippet de gtag vive en el `<head>` de `Layout.astro` y Astro lo bundlea (`hoisted.js`). Corre **una sola vez** (módulo ESM cacheado), así que las navegaciones cliente de ViewTransitions no dispararían pageview: el mismo script escucha `astro:page-load` y emite `gtag("event","page_view",{ page_location, page_path, page_title })`. `astro:page-load` también se dispara en la **carga inicial**, y esa ya la cuenta `gtag('config')` → un flag `firstLoad` la descarta (sin él cada visita contaría doble). Una recarga completa (p. ej. el cambio de idioma, que no pasa por el router) re-ejecuta el módulo: el flag vuelve a `true` y `gtag('config')` cuenta el pageview. **No tocar el bootstrap de dark mode ni el redirect de `/`**: son los scripts con hash de la CSP.
- **Links de contacto** — `src/data/contact.ts` es la única fuente del teléfono y el email: `waLink(message)` (WhatsApp con mensaje precargado) y `mailtoLink(subject)` (email con asunto). Lo usan el botón flotante de `Layout`, `Hero` y `Contact`. El copy vive **una sola vez** en i18n: `layout.whatsappMessage` (mensaje de WhatsApp, global) y `contact.emailSubject`; `Hero` y `Contact` lo reciben como prop `waMessage` desde la página. Los iconos del `Footer` siguen con `wa.me` pelado (fila de iconos, sin texto).

## Build & Deploy

```bash
npm run dev       # http://localhost:4321/es/
npm run build     # outputs to dist/
```

Deployed to Vercel at `https://julianrecarte.dev/`. Domain configured with Vercel.

## SEO & GEO (SEO para IA)

Assets y convenciones introducidos para SEO clásico + Generative/Answer Engine Optimization:

- **`public/llms.txt`** — resumen citable para LLMs (quién, stack, servicios, contacto, URLs canónicas, casos de estudio, `/sobre-mi/`). Enlazado desde `robots.txt`.
- **`public/robots.txt`** — `Allow` explícito para crawlers de IA (`GPTBot`, `OAI-SearchBot`, `ChatGPT-User`, `ClaudeBot`, `Claude-Web`, `PerplexityBot`, `Google-Extended`, `Applebot-Extended`, `CCBot`) + Sitemap.
- **Imágenes OG 1200×630** — `public/og-cover.jpg`, `og-triba.jpg`, `og-multiservizi.jpg`. Se generan con `node scripts/generate-og.mjs` (usa `sharp`). El script es una herramienta local, no corre en el build.
- **`src/data/schema.ts`** — builders de JSON-LD (`websiteSchema`, `aboutPageSchema`, `professionalServiceSchema`, `projectsItemList`, `reviewsSchema`, `faqSchema`, `breadcrumbSchema`). Layout siempre emite `Person` (+ `Article`/`HowTo`), y cada página suma nodos vía la prop `schema` de `Layout`.
- **`Person`** — `@id` estable (`/#person`), `email`, `image` (`og-cover.jpg`), `sameAs` (GitHub/Instagram/LinkedIn, sin `wa.me`) y `knowsLanguage` como objetos `Language`.
- **`Article`** (case studies) — `datePublished` desde `projects.ts` (`publishedAt`, ISO) y `dateModified` = fecha de build; `image` absoluta, `mainEntityOfPage`, `publisher` con logo.
- **`AboutPage`** en `/sobre-mi` — declara el tipo de página con `mainEntity`/`about` → `#person` e `isPartOf` → `#website` (ficha de entidad para IA).
- **Headers de seguridad** — `vercel.json` emite `Strict-Transport-Security`, `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy` y **`Content-Security-Policy`**.
- **CSP** — allowlist: `script-src 'self' + hashes + googletagmanager`, `style-src 'self' 'unsafe-inline' + fontshare/googleapis` (Astro inlinea `<style>` y hay `style="…"` inline → `'unsafe-inline'` es inevitable), `font-src cdn.fontshare.com + fonts.gstatic.com`, `connect-src` a GA y `vitals.vercel-insights.com`, `frame-ancestors 'none'`.
  - Los **hashes** cubren los 2 únicos scripts inline: el bootstrap de dark mode (12 páginas) y el redirect por idioma de `/`. **Si se toca cualquiera de esos scripts, el hash deja de valer y el script se bloquea en silencio** (dark mode parpadea, `/` no redirige). Recalcular con:
    ```bash
    npm run build && node -e "
    const fs=require('fs'),crypto=require('crypto');
    const h=fs.readFileSync('dist/es/index.html','utf8');
    for(const m of h.matchAll(/<script(?![^>]*\bsrc=)(?![^>]*ld\+json)[^>]*>([\s\S]*?)<\/script>/g))
      console.log('sha256-'+crypto.createHash('sha256').update(m[1],'utf8').digest('base64'));
    "
    ```
  - El snippet de gtag **no** necesita hash: al no llevar `is:inline`, Astro lo bundlea en `hoisted.js` (mismo origen).
  - Los `<script type="application/ld+json">` **no** están sujetos a `script-src` (son data blocks, no se ejecutan).
  - Speed Insights carga su script desde `/_vercel/speed-insights/script.js` → `'self'`.
  - Verificación sin navegador: extraer cada `src`/`href`/`url()` del build y contrastarlo con las directivas (los orígenes deben dar OK y los hashes coincidir con `vercel.json`).
  - El pageview de las navegaciones cliente **no** pide directivas nuevas: lo emite el propio snippet bundleado (ver **Analytics**).
- **LCP / preload** — `Layout` expone `<slot name="head" />`; el home inyecta `<link rel="preload" as="image">` de la imagen del hero (misma optimización que `<Image>`, vía `getImage()`), con `fetchpriority="high"` y `width`/`height` explícitos. `fondoTriba` usa `<Image>`.
- **`/` (raíz)** — `noindex` en `src/pages/index.astro`; el 308 a `/es/` lo resuelve `vercel.json`.
- **Sitemap** — `astro.config.mjs` excluye la raíz `/` (es solo redirect a `/es/`) para evitar el conflicto hreflang `es-ES`.
- **`x-default`** — dinámico: apunta a la versión del idioma por defecto del `alternates` (antes estaba fijo al home).
- **Página `/sobre-mi`** (`src/pages/[lang]/sobre-mi.astro`) — página citable con FAQ visible (`<details>`) + `AboutPage`, `FAQPage`, `ProfessionalService` y `BreadcrumbList`. Enlazada desde el `Footer` y desde el menú principal (**Sobre mí**, ítem de ruta, no ancla).
- **Menú** — `Nav.astro` mezcla ítems ancla (`#id`) y de ruta (`href`); todos llevan `data-nav-section` para el resaltado de sección activa (`nav.ts`, ids `soluciones · proyectos · sobre · contacto`). **Proceso** ya no está en el menú (su contenido sigue en la home, accesible por scroll).
- **Teaser "Sobre mí"** — `AboutTeaser.astro` en la home (entre Projects y Testimonios), copy corto y **distinto** al de `/sobre-mi/`, con CTA a la página dedicada (refuerza el internal linking).
- **H1** — Hero incluye el rol (`sr-only`) y los case studies muestran un `<h1>` visible con el nombre del proyecto.
- **i18n** — claves nuevas: `layout.bio`, `layout.home`, `footer.about`, `nav.about`, sección `about` (incluye `metaDescription`, `faq` y claves del teaser).

## UX Improvement Map (division de componentes / flujos)

División del proyecto en componentes y flujos con su potencial de mejora de UX. Usar para
elegir UN foco puntual en vez de «mejorar todo». La etiqueta **Foco recomendado** marca la
mayor oportunidad de retorno actual.

| # | Componente / Flujo | Cómo está hoy | Oportunidad de UX | Impacto | Esfuerzo |
|---|---|---|---|---|---|
| 1 | **Hero (flujo de entrada)** | Pantalla completa sticky, sin indicador de scroll | Falta un tercer CTA secundario granular | Alto | Bajo |
| 2 | **Nav (orientación)** | Links ancla; sin botón de acción en desktop | Falta un CTA "Hablemos / Contactar" persistente en desktop y breadcrumb visual de sección activa más claro | Alto | Bajo |
| 3 | **Projects (pilar de venta)** | 3 cards (Triba, Multiservizi live + SP "Próximamente"); cards sin botón "Ver sitio", solo link "Caso de estudio" anclado al fondo | Falta profundidad en SP; sin filtros ni categorías | **Muy alto (Foco recomendado)** | Medio |
| 4 | **Testimonials (prueba social)** | Carousel con 4 items; sin autoplay ni teclado | Falta autoplay opcional, navegación con ← →, y en desktop mostrar 2 cards | Medio | Bajo |
| 5 | **Contact (conversión)** | 3 botones: WhatsApp, IG, Email — WhatsApp con **mensaje precargado** y email con **asunto**, en los 3 idiomas (`src/data/contact.ts`) | Queda opcional mencionar número/timing en el copy | Medio | Bajo |
| 6 | **Process (confianza)** | Timeline de 4 pasos | Está bien; oportunidad menor de profundidad visual por paso | Bajo | Bajo |
| 7 | **Footer (cierre)** | Solo copyright + firma | Falta mini-navegación / sociales / CTA de cierre para no depender del scroll | Medio | Bajo |
| 8 | **Floating (WhatsApp + Top)** | Ambos aparecen al scroll | Funcionan bien; oportunidad menor de tooltip/label | Bajo | Bajo |

## Case Studies — Implementado (Triba + Multiservizi live)

Páginas dedicadas por proyecto en `[lang]/proyectos/[slug].astro` (slug invariante, `switchLang` conserva path). Triba y Multiservizi live con logo linkeado a su `liveUrl` (`CaseStudy.astro` generalizado: si hay `liveUrl`, el logo linkea; si no, `<img>` plano). SP en `comingSoon`. Orden de cards: Triba, Multiservizi, SP (los live primero). Usa `SectionFade` no, hero con `fondoTriba.webp` + veil `color-mix` (solo Triba; Multiservizi usa su wash burdeos). Mockup Multiservizi solo desktop (`mockupDesktopMulti.webp`, fallback en mobile hasta cargar el dedicado).

### Layout: página normal con scroll (nada de `lock`)

La página **no** está bloqueada. Antes usaba `lock` (`body.is-locked` → `height:100dvh; overflow:hidden` en ≥768px) y todo el case study quedaba comprimido en **una sola pantalla**: la nav (76px) y el footer (~130px) eran hijos del mismo flex column de `100dvh` y le robaban alto al hero. El contenido solo "entraba" porque estaba encogido a la fuerza — H1 bajado a `.t-h3` y mockup capado con `max-h-[70vh]` + `object-contain` (que además lo encogía y le dejaba aire a los costados). Con viewport bajo (1024×600), zoom ≥125% o en `en`/`it` (el subtítulo envuelve en más líneas) se **recortaba en silencio**, sin scroll ni barra.

- `body.is-locked`, el `lock` de `Layout` y el `lock` de `[slug].astro` **se eliminaron** (era su único uso). El `main` vuelve a fluir, el footer deja de robar altura y los botones flotantes (WhatsApp / subir) vuelven a aparecer en estas páginas.
- Hero: `pt-[calc(var(--navbar-h)+3rem)] pb-16 md:pt-[calc(var(--navbar-h)+4rem)] md:pb-24 lg:pb-28` (Tailwind normaliza el `+` a `calc(var(--navbar-h) + 3rem)`; sin espacios sería CSS inválido, pero eso lo resuelve el plugin).
- Mockup a **tamaño natural** (`w-full h-auto`): 1200×1320 → 726px de alto a 660px de ancho.
- Los `[data-reveal]` vuelven a dispararse **al scrollear** (antes disparaban todos juntos: todo estaba en viewport).
- La **nav es fija** (como el home) y el botón "volver" pasó a `absolute top-24 md:top-28` para no quedar debajo de ella.

## Case Studies — Plan en pausa (histórico)

Feature aprobado: **una página de case study por producto** (`/es/proyectos/<slug>/`). Resuelve
SEO/IA (#5 del audit) y ataca el foco recomendado del mapa UX (#3 Projects). Enfoque confirmado:
**Opción A — página dedicada**, la card del home queda como resumen + link al case study.

### Decisiones tomadas

- **Slug invariante por idioma** (`triba`, `sp-soluciones-textiles`, `multiservizi`) → el
  `switchLang` de `lang-selector.ts` ya funciona gratis (conserva el path, cambia solo el idioma).
- **Los 3 proyectos llevan case study**, aunque hoy solo Triba esté lanzado. Los otros usan
  estado "Próximamente" + CTA de contacto reforzado. Al lanzarse solo cambia `liveUrl` en `projects.ts`.
- **Copy y stack: drafteados por mí, Julián los corrige luego.**
- **Stack drafteado:** Triba = Astro · Tailwind · Supabase; SP = Astro · Tailwind;
  Multiservizi = Astro · Tailwind · Supabase. **Pendiente de confirmar por Julián.**

### Decisión de diseño (skill frontend-design)

El case study **viste la paleta del proyecto**, no la del sitio. Cada proyecto ya tiene su
identidad en `projects.ts` (gradiente: Triba=rojo, SP=ámbar, Multiservizi=burdeos). La página
es "entrar al mundo del producto" manteniendo coherencia con el sistema (beige `#E8E0D0`,
copy `#1A1613`, Outfit display + Satoshi body).

- Nuevo token `--project-accent` derivado del gradiente de cada proyecto (eyebrow, hover, wash).
- Tipografía existente; título del proyecto en Outfit (`500`).
- **Sin marcadores numerados** (01/02/03): el contenido es narrativo. Eyebrows semánticos:
  *El proyecto / El desafío / La solución / Resultados*.
- Resultados como bloques cortos con viñeta, **no** stats inventadas ni "big number" template.

### Wireframe

```
NAV persistente
HERO · wash del gradiente del proyecto (signature)
  eyebrow: CASO DE ESTUDIO · AÑO · logo del proyecto
  H1: nombre del proyecto (Outfit)
  stack chips + [Ver sitio →] / [Próximamente]
El proyecto    · párrafo apertura (2 col desktop)
El desafío ║ La solución   (split, eyebrow por col)
Resultados     · 4 highlights (bloques cortos)
Screenshots    · galería (solo Triba hoy)
Siguiente proyecto →  (nav cíclica entre los 3)
CTA de cierre  · contacto WhatsApp
FOOTER
```

### Signature

Hero con **wash de gradiente del proyecto + logo + título comprimido**. Único punto de
audacia; todo lo demás silencioso. Sin animaciones nuevas: reusar `data-reveal-heading`
(cine-text), `data-reveal`, stagger en screenshots.

### Estructura i18n (por idioma)

```json
"caseStudies": {
  "triba": {
    "eyebrow", "title", "subtitle", "overviewTitle", "overview",
    "challengeTitle", "challenge", "solutionTitle", "solution",
    "resultsTitle", "results[]", "stackLabel", "viewSite", "comingSoon",
    "backLabel", "nextLabel", "ctaTitle", "ctaBody", "ctaButton"
  },
  "sp-soluciones-textiles": { ... },
  "multiservizi": { ... }
}
```

### Implementación pendiente

1. `src/data/projects.ts` → `slug`, `year`, `stack[]`, `accent`, `challenge`, `solution`, `results`, `liveUrl`.
2. `es/en/it.json` → sección `caseStudies` con copy drafteado (Triba ya drafteado; falta SP y Multiservizi).
3. `src/pages/[lang]/proyectos/[slug].astro` → `getStaticPaths()` (3 slugs × 3 idiomas), usa `Layout`.
4. `src/components/CaseStudy.astro` → hero + secciones narrativas + schema `Article` en head.
5. `ProjectCard.astro` → `href` interno al case study; sin botón "Ver sitio" en cards (paridad visual entre Triba y Multiservizi, decisión explícita). `liveUrl` en `projects.ts` solo alimenta el logo linkeado del case study. Link "Caso de estudio" anclado al fondo (`article` + contenido en `flex-col`, bloque de acciones con `mt-auto`) para alinear cards con descripciones de distinto largo.
6. Sitemap + hreflang automáticos (ruta en `[lang]`, Layout ya emite alternates).

### Preguntas abiertas (responder antes de construir)

1. ¿Hero con wash de gradiente **a color pleno** (signature) o más sobrio con gradiente solo en borde?
2. ¿Incluir **Waves** de fondo en el case study? Recomendado: **no** (aire más editorial/limpio).
3. ¿Confirmar **stack drafteado** de cada proyecto?
4. ¿Los **resultados de Triba** (4 bullets) son reales o hay métricas concretas (tiempo de carga, suscriptores)?
