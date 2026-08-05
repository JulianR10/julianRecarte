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
│   ├── slot "hero" → Hero.astro
│   └── slot default → Waves, Projects, Testimonials, Process, Contact, Footer
```

### Script Lifecycle (ViewTransitions)

Every interactive script uses `createLifecycle(init, destroy)` from `@scripts/lifecycle.js`:

```js
// In Layout.astro <script>:
import { initAll, destroyAll } from "@scripts/main.js";
import { createLifecycle } from "@scripts/lifecycle.js";
createLifecycle(initAll, destroyAll);
```

- `astro:before-swap` → calls `destroy()` (clean listeners, kill GSAP contexts)
- `astro:page-load` → calls `init()` (re-attach listeners, re-create animations)

### Shared Scroll Utility

`@scripts/scroll-source.ts` exports `onScroll(callback)` — subscribers notified from Lenis scroll. Multiple modules subscribe, one source runs. Each call returns an unsubscribe function.

```ts
import { onScroll } from "@scripts/scroll-source";
const cleanup = onScroll((scroll, velocity, direction) => { /* ... */ });
// later: cleanup()
```

### Language Switching

`LangSelector.astro` renders flag buttons. `nav.ts` handles dropdown toggle and navigates via `window.location.pathname` rewrite (full page reload with ViewTransitions slide).

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

## Known Pitfalls

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

All modules use `defineAnimation` / `gsap.context()` for scoped cleanup. `destroy()` calls `ctx.kill()`.

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

## Analytics

`@vercel/speed-insights` se inyecta en el `<head>` de `Layout.astro` mediante el componente `<SpeedInsights />`. No requiere configuración adicional — Vercel recolecta los datos automáticamente.

## Build & Deploy

```bash
npm run dev       # http://localhost:4321/es/
npm run build     # outputs to dist/
```

Deployed to Vercel at `https://julianrecarte.dev/`. Domain configured with Vercel.

## UX Improvement Map (division de componentes / flujos)

División del proyecto en componentes y flujos con su potencial de mejora de UX. Usar para
elegir UN foco puntual en vez de «mejorar todo». La etiqueta **Foco recomendado** marca la
mayor oportunidad de retorno actual.

| # | Componente / Flujo | Cómo está hoy | Oportunidad de UX | Impacto | Esfuerzo |
|---|---|---|---|---|---|
| 1 | **Hero (flujo de entrada)** | Pantalla completa sticky, sin indicador de scroll | Falta un tercer CTA secundario granular | Alto | Bajo |
| 2 | **Nav (orientación)** | Links ancla; sin botón de acción en desktop | Falta un CTA "Hablemos / Contactar" persistente en desktop y breadcrumb visual de sección activa más claro | Alto | Bajo |
| 3 | **Projects (pilar de venta)** | 3 cards, solo 1 con "Ver sitio", sin filtros ni caso de estudio | Severa falta de profundidad: solo 1 proyecto en vivo, cards sin click fuera de Triba, sin categorías | **Muy alto (Foco recomendado)** | Medio |
| 4 | **Testimonials (prueba social)** | Carousel con 4 items; sin autoplay ni teclado | Falta autoplay opcional, navegación con ← →, y en desktop mostrar 2 cards | Medio | Bajo |
| 5 | **Contact (conversión)** | 3 botones: WhatsApp, IG, Email | Falta WhatsApp con **mensaje pre-cargado** y (opcional) número/timing; email sin asunto | Alto | Bajo |
| 6 | **Process (confianza)** | Timeline de 4 pasos | Está bien; oportunidad menor de profundidad visual por paso | Bajo | Bajo |
| 7 | **Footer (cierre)** | Solo copyright + firma | Falta mini-navegación / sociales / CTA de cierre para no depender del scroll | Medio | Bajo |
| 8 | **Floating (WhatsApp + Top)** | Ambos aparecen al scroll | Funcionan bien; oportunidad menor de tooltip/label | Bajo | Bajo |

## Case Studies — Plan en pausa (retomar luego)

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
copy `#1A1613`, Mozilla Headline display + Satoshi body).

- Nuevo token `--project-accent` derivado del gradiente de cada proyecto (eyebrow, hover, wash).
- Tipografía existente; título del proyecto en Mozilla Headline con eje de width comprimido.
- **Sin marcadores numerados** (01/02/03): el contenido es narrativo. Eyebrows semánticos:
  *El proyecto / El desafío / La solución / Resultados*.
- Resultados como bloques cortos con viñeta, **no** stats inventadas ni "big number" template.

### Wireframe

```
NAV persistente
HERO · wash del gradiente del proyecto (signature)
  eyebrow: CASO DE ESTUDIO · AÑO · logo del proyecto
  H1: nombre del proyecto (Mozilla comprimida)
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
5. `ProjectCard.astro` → `href` interno al case study; botón "Ver sitio" (solo Triba) como acción secundaria.
6. Sitemap + hreflang automáticos (ruta en `[lang]`, Layout ya emite alternates).

### Preguntas abiertas (responder antes de construir)

1. ¿Hero con wash de gradiente **a color pleno** (signature) o más sobrio con gradiente solo en borde?
2. ¿Incluir **Waves** de fondo en el case study? Recomendado: **no** (aire más editorial/limpio).
3. ¿Confirmar **stack drafteado** de cada proyecto?
4. ¿Los **resultados de Triba** (4 bullets) son reales o hay métricas concretas (tiempo de carga, suscriptores)?
