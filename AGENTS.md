# Architecture Guide — julianRecarte portfolio

## Project Overview

Single-page Astro portfolio with GSAP animations, Lenis smooth scrolling, i18n (es/en/it), and ViewTransitions. Deployed to GitHub Pages at `/julianRecarte`.

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

## Build & Deploy

```bash
npm run dev       # http://localhost:4321/julianRecarte/es/
npm run build     # outputs to dist/
```

Deployed to GitHub Pages at `https://julianrecarte.github.io/julianRecarte/`. Base path is `/julianRecarte`.
