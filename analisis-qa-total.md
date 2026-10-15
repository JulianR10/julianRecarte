# Auditoría Senior Total — `julianRecarte` (2026-09-06)

> **Estado de ejecución (2026-10-15).** Este documento es la auditoría original (2026-09-06).
> A la fecha está ejecutado el **P0** y el **P1** de SEO clásico + SEO para IA (GEO) — salvo las
> rutas `comingSoon` (decisión: omitir). También: 404 con `noindex`, root `/` con `noindex`,
> headers de seguridad en `vercel.json`, menú con *Sobre mí*, página `/sobre/` citable
> (`AboutPage` + `FAQPage`), teaser en la home y preload del LCP.
> Sigue pendiente (**P2**): `IndexNow`, `manualChunks` GSAP/Lenis, blog/notas citables,
> CSP con nonce, a11y (alt/contraste/touch targets) y migración Astro 5 + Tailwind 4.

> Auditoría en modo solo lectura, sin cambios aplicados. Cubre: código muerto, refactor, UI/UX, colores, tipografías, marca, seguridad, SEO clásico, SEO para IA y marketing. Base: `src/`, `public/`, `package.json`, `astro.config.mjs`, `tailwind.config.mjs`, `vercel.json`, `mejoras.md`, `AGENTS.md`.
> Validación de `mejoras.md` (17 pts): **13 vigentes, 1 parcial (#4), 1 corregido (#11 hero-scroll ahora usa `matchMedia`), 1 resuelto (#15)**.

## 0. Resumen ejecutivo

Sitio bien arquitecturado (Astro SSR + `lifecycle.ts` + `scroll-source.ts` + hooks `data-*`). No hay desastre estructural, pero sí **3 riesgos críticos, ~25 medios y deuda acumulada**:

1. **Crítico a11y:** `src/scripts/reveal-observer.ts:4` retorna temprano con `prefers-reduced-motion` sin añadir `.revealed` → `[data-reveal]` queda en `opacity:0` para siempre (`src/styles/globals.css:154-163`). Contenido invisible.
2. **Crítico SEO:** `src/layouts/Layout.astro:73-83` usa `twitter:card=summary_large_image` sin ningún `og:image` / `twitter:image`. Previews rotos en WA/X/LinkedIn. No existe asset `og-*` en `public/` ni `src/assets/images/`.
3. **Crítico lifecycle:** `src/scripts/lifecycle.ts:5,9` + `src/layouts/Layout.astro:208` + `src/components/Nav.astro:192` registran listeners de documento sin cleanup → con ViewTransitions se duplican `initAll` / `initNav` en cada navegación (`mejoras.md #12`, subir a 🔴).

---

## 1. Código muerto (borrar o cablear)

| ID | Ubicación | Hallazgo |
|---|---|---|
| D1 | `src/components/flags/EsFlag.astro`, `EnFlag.astro`, `ItFlag.astro` | 0 imports. `LangSelector.astro:15-19` usa texto ES/EN/IT intencional (W3C). Borrar carpeta o quitar de `README.md:46` |
| D2–D4 | `src/data/projects.ts:15,16,22,32,45,56` | `year`, `stack`, `heroImage` definidos, ningún template los lee. Decidir: mostrar chips + año en `CaseStudy` / `ProjectCard` o borrar campos + imports |
| D5 | `src/data/projects.ts:25,39,50,61` + `src/pages/[lang]/proyectos/[slug].astro:61` | `screenshots` solo se usa como `og:image` fallback, nunca galería. `tabletHorizontal.webp` huérfano total (no importado en `projects.ts:1-10` ni `process.ts`) |
| D6 | `src/scripts/scroll-source.ts:20` | `clearListeners()` exportada, 0 llamadas. Llamarla en `destroyAll` como red de seguridad |
| D7 | `src/components/ProjectCard.astro:21` | Prop `accent` pasada en `Projects.astro:50` pero nunca usada (usa `style` string `:39`) |
| D8 | `src/components/Logo.astro:2` (`className?`), `src/components/SectionHeader.astro:4` (`id?`) | Nunca consumidas. Cablear `id` a `aria-labelledby` o borrar |
| D9 | `src/components/ProjectCard.astro:41-43` | Rama fallback grid-SVG inalcanzable (los 3 proyectos tienen `image`) |
| D10 | `src/scripts/lifecycle.ts:4` | Retorno `{init,destroy}` descartado en ambos callers |
| D11 | `src/data/process.ts:42` / `Process.astro:42` | Fallback `step.title/step.description` inalcanzable (`ProcessStepData:7-11` no tiene esos campos, `t.steps[i]` siempre existe) |
| D12 | `public/404.html` | Huérfano: Vercel sirve el 404 de Astro, no este HTML. Borrar o configurar rewrite en `vercel.json` |

> `darkMode:"class"` (`tailwind.config.mjs:3`) **no** es muerto: `nav.ts:31,34,53` + `Layout.astro:177-184` + variantes `dark:` en ~10 componentes lo usan.

---

## 2. Refactor / malas prácticas

### 2.1 Lifecycle / ViewTransitions (riesgo mayor)

- Listeners sin cleanup (`lifecycle.ts:5,9`): cada evaluación de `<script>` en `Layout.astro:205-209` y `Nav.astro:189-193` añade 2 listeners permanentes → tras N navegaciones hay N×`initAll` + N×`initNav`. Fix: guard `window.__lc`, `AbortController`, o mover a `astro:after-swap`.
- Doble sistema desacoplado: `main.ts:32-49` no incluye `nav`; orden `initLenis → … → ScrollTrigger.refresh()` vs `initNav` (setea `--navbar-h`) no garantizado.
- `main.ts:18` `gsap.registerPlugin` a nivel módulo se re-ejecuta por navegación.
- `scroll-source.ts:3` sin safety net (solo `nav.ts:272` y `back-to-top.ts:27` suscritos, ambos desuscriben bien, pero un olvido futuro fuga para siempre).
- `nav.ts:203-266` dropdowns duplicados: `querySelectorAll(".lang-option")` global → desktop y overlay attachan handlers a **todas** las opciones; `docClick/keydown` ×2. `lastScrollY (:270)` no se resetea en `destroy`. `switchLang:182-191` hace `scrollTo(0,0)` inútil antes de reload. `setTheme:39` lee `offsetLeft` pre-layout (puede ser 0).

### 2.2 Módulos GSAP / JS

- `lenis-adapter.ts:26` `lagSmoothing(0)` global — afecta timelines no-scroll (`mejoras #10` vigente). Sin `prefers-reduced-motion` (`lerp:0.1 + smoothWheel` aunque el usuario pida reducir movimiento).
- `magnetic.ts:12` `willChange="transform"` permanente — viola `AGENTS.md` (pitfall `will-change`) y promociona a GPU todos los `[data-magnetic]` en idle, rompiendo `backdrop-filter` del nav. Setear solo en `mousemove`, limpiar en `mouseleave` (como `card-tilt.ts:16,42`).
- `card-tilt.ts:57-60` destroy no mata `gsap.to` en vuelo ni resetea `willChange` mid-hover. Magics `±6`, `perspective:1000`.
- `hero-zap.ts:8-45` sin gating: `delayedCall(random 1.5-4)` + timeline por flash corre con pestaña oculta o hero fuera de viewport. Sin `IntersectionObserver` = CPU/batería.
- `waves.ts:26-27` `matchMedia + innerHeight` una sola vez (amplitud rancia tras resize); `trigger:body scrub:true` full-page + 3 `repeat:-1 yoyo` = costo permanente.
- `hero-scroll.ts:8-10` corregido (`gsap.matchMedia` + `mm.revert()`, `mejoras #11` ✅). Restan: `orbs` query `document`-wide, magics `end:"bottom-=20% top"`, `scrub:0.3/1`, mutación directa `hero.style.pointerEvents`.
- `cine-text.ts:12,21` `!` assertions (`textContent!`, `parentNode!`) crashean en nodo vacío; parte palabras en `cine-char` sin `aria-label` (lectores deletrean); pelea con `reveal-observer` por `.revealed`; `checkReducedMotion:false + branch manual :31` duplica `gsap-factory:19`.
- `soluciones-lines.ts:8` + `globals.css:277-279`: `scaleX(0)` en CSS y `gsap.set` en JS → sin JS y con CSS, líneas invisibles para siempre (solo `noscript` rescata, no "JS falló"). Trigger hardcodeado `#soluciones`.
- `reveal-observer.ts:6` observa `[data-reveal-heading]` ya manejados por `cine-text` → doble observación. `threshold:0.15` mágico, sin `rootMargin`.
- `back-to-top.ts:40-78` `setTimeout(800/150/700)` y `gsap.to(btn)` no cancelables en `destroy:104-109` → operan sobre nodo detached tras swap. `THRESHOLD=400`, `BURST_COUNT=24`, colores hardcodeados.
- `testimonials-carousel.ts:18-20` + `projects-carousel.ts:19` `getElementById(...)!` + `if(!…)` (`mejoras #13` vigente). `parseInt` sin radix, `setPointerCapture` sin `try` (projects sí tiene), `projects-carousel:17` check-once mobile (resize rompe), `step=offsetWidth+16` acoplado a `gap-4`.
- `safe-t.ts:1-13` Proxy recursivo envuelve arrays (`mejoras #17` vigente): `filter/slice/map` devuelven arrays sin proxy por accidente.
- Magics CSS/JS acoplados por string (`testimonials-carousel:7` toggla clases que deben existir en `Testimonials.astro:115`).
- `hero-rotator.ts:145-148` ejemplar (`resize` + `fonts.ready` + `alive` flag + `timer?.kill()`). Modelo a replicar en `waves` / `hero-zap`.

### 2.3 Toolchain (`package.json`)

- Astro `^4.15.0` major behind (v5 trae content-layer, `astro:env`, `@tailwindcss/vite` en vez de `@astrojs/tailwind`). Tailwind 3 vs 4 (v4 CSS-first). `gsap ^3.12` vs 3.13, `lenis ^1.1` vs 1.3 (minors). `sharp ^0.35.3` sí necesario (`astro:assets`), bien presente.
- Faltan scripts: `lint`, `typecheck` (`astro check` / `tsc --noEmit`), `test:watch`, `test:coverage`; `format` sin `--check` para CI. Sin `eslint`/`stylelint` instalados → cero guardarraíles para `!`, magics, a11y.

### 2.4 Tests / coverage gaps

Cubierto: `component.test.ts` (7), `nav.test.ts` (8, `FakeIO` frágil), `project-content.test.ts` (4). Faltan: `scroll-source` (error en subscriber silenciado por `try/catch:13`), `gsap-factory` (corazón anti-leak), `lifecycle` (bug mayor sin red), `lenis-adapter`, `cine-text` (`wrapTextNodes`, nodos vacíos), `safe-t` (arrays, key faltante → `""` silencioso), carousels / `back-to-top` / `hero-rotator` / `reveal-observer`, test de paridad i18n (`Object.keys` diff `es/en/it`).

---

## 3. UI — colores, tipografía, fails

### 3.1 Colores

Sistema: tokens `globals.css:8-26` (`--bg-hex #E8E0D0`, `--copy #1A1613`, `accent-orange #FF5C2B / warm #FF7A4F / pastel #FFB088 / purple #5B1FFF`) + espejo parcial en `tailwind.config.mjs:7-19`. Dark: `--bg-hex #1C1A18`, `--copy #F0F0F0`.

1. Superficies dark duplicadas: `dark.card #252525` vs `LangSelector.astro:79 --dd-bg #1A1A1A` vs `#1C1A18`. Unificar `dd-bg → var(--bg-hex)` / `dark.card`.
2. `Soluciones.astro:36,38` `bg-black/[0.08] dark:bg-white/[0.08]` fuera de token → `bg-copy/10 dark:bg-dark-copy/10` o token `--line`.
3. `CaseStudy.astro:96,121,130,140` `dark:text-[#A0A0A0]` hardcode (no existe en config, `dark.muted #888888`) → `dark:text-dark-muted` o nuevo `dark.soft`.
4. Negros/blancos crudos dispersos (`Nav.astro:82,100,105`, `ProjectCard.astro:27,45-47`); `Process.astro:34,38` usa `rgba(91,31,255,.2)` / `rgb(255,92,43)` inline en vez de `rgba(var(--rgb-accent-*))` como `process.ts:16-31`.
5. **3 gradientes primarios distintos:** Hero/Soluciones/Card `orange→pastel` (correcto) vs Nav progress `orange→purple` vs Nav menu `orange→warm→pastel` vs Contact WhatsApp sólido. Decidir 1 primario (`orange→pastel`) + 1 acento (`orange→purple` solo progress/waves); alinear `Contact.astro:48`.
6. Paleta proyectos (`projects.ts:34,47,58` `#DE062E / #FF9C3A / #800020`) sin token, solo `--project-accent` inline en `CaseStudy.astro:31,45`. Documentar como excepción "mundo del producto" o mapear a `accent-*`.
7. Falta `colors.base: "var(--bg-hex)"` en Tailwind (hoy `bg-[var(--bg-hex)]` ad-hoc en `Layout.astro:218,227`, `CaseStudy.astro:35`).
8. `tailwind.config` sin `fontFamily.headline`: todo headline depende del selector base `globals.css:100-108` (frágil).

### 3.2 Tipografía

Carga `Layout.astro:158-175`: Fontshare Satoshi 400/500/700 + Google Bricolage Grotesque variable, `display=swap` correcto. Pero:

1. `preload as="style"` sin `onload` (`:159-164`): preload + stylesheet a la misma URL = doble fetch potencial. Añadir `onload="this.rel='stylesheet'"` o dejar solo `preconnect + stylesheet`.
2. Fallbacks pobres (`"Satoshi", sans-serif` / familia display sin stack) → **resuelto**: stacks de sistema en body, títulos y skip-link.
3. Jerarquía plana: `Hero.astro:61` y `SectionHeader.astro:24` ambos `6xl` en `lg`; 4 escalas de `h3` (`Soluciones:44 2xl→3xl bold`, `Process:90 3xl→5xl medium`, `ProjectCard:59 2xl`, `Testimonials:94 base bold` — único `bold` del sistema). Definir tabla `display 40/60, title 24/32, body 16/18`.
4. `.label-outline` (`globals.css:199-205`) sin `color` base fuera de `@supports` (funciona por accidente vía `text-accent-orange` del markup).
5. `tracking 0.3em` uppercase en `text-xs/sm` (`Hero:36`, `SectionHeader:16`, `Process:85`) desborda en IT (`Testimonianze`) en 360px → `0.22em` mobile, `0.3em` solo `md:+`; añadir `text-balance` en títulos (hoy solo Hero/Soluciones/Process lo tienen). `Hero:94 font-satoshi` redundante (body ya es Satoshi).

### 3.3 UI fails (archivo:línea)

- **Touch <44px:** `Nav.astro:52-59` `w-8 h-8` theme; `LangSelector.astro:30` `md:px-2 md:py-1.5`; `Testimonials.astro:49,102` `w-10 h-10` flechas; `Contact.astro:48,58,66` `px-6 py-3` ≈42px. OK: `Nav:67 w-12 h-12`, dots con `p-4` + `bg-clip-content` (~44px, mantener patrón).
- **Contraste:** `accent-orange #FF5C2B`/beige ≈2.8:1 FAIL (Hero:36,74,94; SectionHeader:16,26; ProjectCard:59,79; Soluciones:44). Usar solo en ≥24px/bold o oscurecer a `#D94315` en light. `text-copy/30` (Soluciones:41), `/50` (Footer:18, Testimonials:95), `accent-orange/60-80` (Process:85, Hero:94) <4.5:1 → mínimo `/60` body, `/70` small. `dark.muted #888`/`#1C1A18` ≈3.5:1 FAIL (Soluciones:48, Process:94, Contact:33) → `#A8A8A8` o reservar `#888` decorativo.
- **Focus:** `globals.css:118-121` `:focus-visible` ok, pero `Nav:67` y `Layout:227` `outline-none` lo anulan. Quitar `outline-none`; dots `focus-visible:outline-offset-4`.
- **Alt/ARIA:** `Logo.astro:24,31 alt="JR"` → `"Julián Recarte — inicio"`; `ProjectCard:39 alt={title}` → `` `${title} — logo` `` (como `CaseStudy:78,87`); `Process:58 alt={s.title}` en ilustrativa → `""` o descripción real; `Testimonials:117` `aria-label` hardcodeado ES (`mejoras #2`); cards ocultas `opacity:0` sin `inert`/`visibility` (focuseables) → `inert` en no-activas; `LangSelector:29 aria-haspopup="true"` → `listbox` + `aria-controls` + `role=option`.
- **Teclado:** Testimonials sin `←/→`, `aria-live="polite" (:57)` anuncia cada swipe → `off` + `arrow-key` handler + `aria-roledescription="slide"`; `Projects:36 tabindex=0` redundante en desktop (`md:overflow-visible`); dropdown sin flechas, `Escape` no devuelve foco (`ddBtn.focus()`).
- **CLS/LCP:** `Hero:126-132` desktop sin `width/height` (`mejoras #1`, mobile `:46-54` sí `1024×1536`); doble `eager` (una oculta con `hidden`) → `fetchpriority="high"` solo visible + `sizes`; `CaseStudy:49-57 fondoTriba` como `<img>` plano sin dimensiones → `width/height` o `<Image>`; `Logo:27-28 200×200` cuadrado con `h-12 w-auto` (`mejoras #5`); sin `preload` de `yo.webp` (`mejoras #7`); sin `manualChunks` GSAP+Lenis (`mejoras #8`).

---

## 4. UX

1. Hero sin scroll-cue (`Hero:25-28` sticky + `min-h-dvh` sin indicador) → chevron `aria-hidden` a `#soluciones`, oculto con reduced-motion.
2. Nav sin CTA (`Nav:40-49` solo 4 anchors + lang + theme) → botón `Hablemos` (`#contacto`) `hidden lg:inline-flex` con gradiente primario.
3. WhatsApp inconsistente: `Hero:107` con `?text=` pre-cargado; `Contact:44` y `Layout:215` pelados; `mailto:64` sin `subject` → helper `waLink(lang, source)` i18n + `utm_source` + `mailto:?subject=…&body=…`.
4. Hovers incoherentes: `Nav:42 hover:tracking-[0.15em]` = layout-shift; `md:hover:` deja touch sin feedback; Contact sólido vs outline → hover solo `color/background`, nunca `letter-spacing` + `:active:scale-95`.
5. Floating (`Layout:213-244` + `back-to-top.ts`) sin tooltip, `aria-label="WhatsApp"` ES hardcodeado, colisión en 360px, `BURST_COUNT 24→12`.
6. Contact sin copiar-email/toast (`Contact:43-70`, `julianrecarteweb@gmail.com`).
7. Orbes `fixed` dentro de hero `sticky` (`Hero:29-30`, `hidden md:block`) → `absolute`.
8. Footer pobre (`Footer:14-32` solo © + firma) → mini-nav + sociales + `Volver arriba`.

---

## 5. Marca / i18n (`es/en/it.json`)

Sin guía de marca (`BRAND*` / `design-tokens*` ausentes; logo `hover:rotate-[25deg]`, firma con `brightness(0)` improvisados) → crear `docs/brand.md` o declarar "sin guía".

- `layout.description`: es "Convierto ideas…" vs en "I turn brands…" vs it "Trasformo marchi…" → alinear.
- `testimonials.carouselLabel`: es/it "Carousel…" (anglicismo) vs `projects.carouselLabel` "Carrusel/Carosello" → es "Carrusel de testimonios", it "Carosello di testimonianze".
- `nav.projects`: "Portfolio" en los 3 idiomas → es "Proyectos", it "Progetti" (o documentar anglicismo).
- `caseStudies`: `triba` completo; `sp-soluciones-textiles` y `multiservizi` solo `title/description/subtitle` → con `safeT` Proxy vacío, `CaseStudy:118-144` renderiza bloques vacíos. Completar keys o condicionar.
- `footer.copyright`: "© {year}" sin nombre → "© {year} Julián Recarte".
- `Testimonials:117`, `Layout:220` hardcodeados ES → keys `gotoTestimonial`, `whatsappLabel`.
- `SP Estampados` (testimonio) vs `SP Soluciones Textiles` (slug) → unificar.

---

## 6. Seguridad

| Sev. | Ítem | Detalle / fix |
|---|---|---|
| Media-Alta | Sin headers (`vercel.json:1-9` solo redirects) | Faltan CSP, HSTS, X-Frame, nosniff, Referrer, Permissions. Añadir al menos `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`; luego CSP permitiendo `fontshare, fonts.googleapis, googletagmanager, wa.me` |
| Baja | Formularios / mailto | Sin `<form>` ni user-input → sin XSS. Spam por exposición en claro (`wa.me/393447817557` en Layout:103,215; Hero:107; Contact:44 + `mailto:`) asumido; alternativa: form + honeypot + Turnstile |
| Baja | Dependencias | Sin CVE crítico conocido; Astro 4 y sharp 0.35 desactualizados → `npm audit && npm outdated`, migrar Astro 5 en rama |
| OK | `target=_blank` / `innerHTML` | 6× `target=_blank` todos con `rel="noopener noreferrer"` (Hero:109-110, Contact:46,56, Layout:217, CaseStudy:71-72, ProjectCard:69-70). `set:html` solo `JSON.stringify` estático; `innerHTML` solo en test |
| Info | gtag inline sin nonce | `Layout.astro:188-194 G-R1ZPHT8LX2` + `google-site-verification:64`. Al añadir CSP requerirá `nonce/hash` o `googletagmanager.com` en `script-src` (o Partytown) |

---

## 7. SEO clásico

OK: title/description únicos por idioma (`Layout:30`), canonical + hreflang + x-default (`Layout:42-47,86-90`, `[slug]:41-45`), H1 único (`Hero:59-64`, `CaseStudy:61 sr-only`), sitemap i18n (`astro.config:11-20`), robots con Sitemap (`public/robots.txt`), trailingSlash coherente.

- **Crítico:** sin `og:image` / `twitter:image` (`Layout:73-83`), sin asset `og-*`. Crear `public/og-cover.jpg 1200×630` (+ `og-triba.jpg`) y props `ogImage` con default absoluto.
- `og:locale:alternate` (`en_US` / `it_IT`) ausente.
- `CaseStudy:61` `h1.sr-only` desperdicia SEO visual → visible con la tipografía display.
- Solo 6 URLs indexables (`[slug]:19-24` filtra `!comingSoon`) → publicar `comingSoon` con `noindex` + CTA o `ItemList` en home.
- `404.html` sin `<meta robots=noindex>`, sin branding, sin CTA contacto.
- Redirect `/→/es/` vía JS (`index.astro:9-15`, doble salto + FOUC) → mover a `astro.config` redirects o middleware.
- Performance: `yo.webp` LCP sin `fetchpriority="high"` ni `preload as=image`; `fondoTriba` `<img src=.src>` crudo en vez de `<Image>` (pierde `sharp` responsive).

---

## 8. SEO para IA (GEO)

- **Crítico faltante:** sin `public/llms.txt` / `ai.txt` / `.well-known/ai-plugin.json`. Crear `llms.txt` (quién, stack, servicios, contacto, URLs canónicas `/es|en|it/` + `/proyectos/triba/`) y referenciarlo en `robots.txt`.
- JSON-LD parcial (`Layout:93-156` Person + Article solo-case + HowTo). Faltan `ProfessionalService` (`makesOffer`, área, precio), `FAQPage`, `Review`/`AggregateRating`, `ItemList`, `BreadcrumbList`, `WebSite+inLanguage`. Errores: `sameAs:103` incluye `wa.me` (sacar a `contactPoint`, dejar github/instagram); `knowsLanguage:117` strings en vez de objetos `Language`; `publisher=Person` débil (usar `Organization` + logo); Article sin `datePublished/dateModified/mainEntityOfPage` (`[slug]:57-62` imagen `undefined` para SP/Multi).
- Reviews/proyectos sin estructurar (`es.json:58-95` 4 testimonios solo HTML; `projects.ts` sin `ItemList`) → emitir `Review {author, reviewBody, itemReviewed}` sin inventar `aggregateRating`.
- Sin página `/sobre` citable (ubicación IT, años, stack, Triba live URL).
- `comingSoon` sin ruta → LLM cita URL que da 404. Generar 9 rutas (3×3) con `noindex` + CTA o `redirect 307 → /{lang}/#proyectos`.
- Bien: SSR extraíble sin JS + `noscript` (`Layout:185`, `Testimonials:163-165`). Mantener, no mover copy a `client:only`.

---

## 9. Marketing / CRO

- Hero genérico ("Hola soy Julián" + rotator) con 2 CTAs ok, pero sin sub-prueba (`Astro • Supabase • 3 proyectos • ES/EN/IT`) ni tercer micro-CTA `Ver caso Triba`. Secundario con contraste límite en light.
- Prueba social débil: 4 items (2× Triba misma empresa, 2× proyectos `comingSoon` no verificables), sin foto/fecha/empresa linkeada, estrellas hardcodeadas 5/5, sin autoplay/teclado, dots sin `aria-selected` → añadir fecha + link `universotriba.com` + cargo verificable + schema `Review`.
- Projects: **ningún `liveUrl` en `projects.ts:28-64`** → botón `Ver sitio` (`ProjectCard:66-75`) nunca renderiza. Único live es logo Triba (`CaseStudy:69-83`). Setear `liveUrl: https://www.universotriba.com/` (botón secundario, link interno case como primario). 2/3 cards solo "Próximamente" sin case (`Projects:55 showCase=!comingSoon`).
- Analytics mide tráfico (SpeedInsights + gtag) pero cero eventos de funnel → 3 eventos (`click_hero_whatsapp`, `click_case_ver_sitio`, `click_contact_* {lang, source}`) + `scroll_depth #proyectos/#contacto` (+ Clarity opcional para heatmaps).

---

## 10. Plan propuesto (P0 → P2)

**P0 (bajo esfuerzo / alto retorno):** fix `revealed` en reduced-motion; `og-cover.jpg 1200×630` + metas; `width/height` hero desktop + `fetchpriority`; headers Vercel base; `waLink(lang,source)` + `mailto subject`; `liveUrl` Triba; dots i18n + `inert` en cards ocultas; quitar `outline-none`; contraste (`#D94315` light / `#A8A8A8` dark-muted); `llms.txt` + robots; `noindex` 404; borrar `flags/` o README; `clearListeners` en destroy + guard lifecycle.
**P1:** unificar tokens (grises / gradientes / `colors.base`); tabla de tipos + `font-stretch`; scroll-cue + CTA nav + footer completo + copiar-email; JSON-LD `ProfessionalService/Review/Breadcrumb` + correcciones; publicar `comingSoon` con `noindex`; eventos GA ×3; galería `screenshots` o limpieza + `tabletHorizontal`; exponer `year/stack` o borrar; tests `lifecycle/gsap-factory/safe-t/i18n-parity`.
**P2:** migrar Astro 5 + Tailwind 4 (rama); `manualChunks` GSAP/Lenis; `eslint + astro check` en CI; `docs/brand.md`; gate `hero-zap/waves/lenis/burst` por reduced-motion + `IntersectionObserver`; dropdown con flechas + foco; carousels teclado + `step` recalc en resize.

---

## 11. Preguntas abiertas (responder antes de construir)

1. **Alcance:** ¿ejecuto el P0 completo primero o quieres un solo foco (ej. SEO+OG vs a11y vs código muerto)?
2. **OG image:** ¿genero `og-cover.jpg` con tu identidad (beige/naranja/tipografía display) o me pasas diseño propio?
3. **Astro 5 / Tailwind 4:** ¿migro en rama separada ahora o lo dejamos como P2?
4. **`year` / `stack` / `screenshots`:** ¿los mostramos en CaseStudy/Card (completo copy) o los borro?
5. **SP y Multiservizi:** ¿publico rutas `comingSoon` con `noindex` + CTA o las mantengo fuera del sitemap?
6. **Contacto:** ¿mantengo email/tel en claro (simple, más spam) u ofusco con formulario + Turnstile?
