# SEO, GEO y analytics

> Assets, JSON-LD, CSP y medición. Volver a [AGENTS.md](../AGENTS.md).

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

## Analytics

- `@vercel/speed-insights` se inyecta en el `<head>` de `Layout.astro` mediante el componente `<SpeedInsights />`. No requiere configuración adicional — Vercel recolecta los datos automáticamente.
- **GA4 (`G-R1ZPHT8LX2`)** — el snippet de gtag vive en el `<head>` de `Layout.astro` y Astro lo bundlea (`hoisted.js`). Corre **una sola vez** (módulo ESM cacheado), así que las navegaciones cliente de ViewTransitions no dispararían pageview: el mismo script escucha `astro:page-load` y emite `gtag("event","page_view",{ page_location, page_path, page_title })`. `astro:page-load` también se dispara en la **carga inicial**, y esa ya la cuenta `gtag('config')` → un flag `firstLoad` la descarta (sin él cada visita contaría doble). Una recarga completa (p. ej. el cambio de idioma, que no pasa por el router) re-ejecuta el módulo: el flag vuelve a `true` y `gtag('config')` cuenta el pageview. **No tocar el bootstrap de dark mode ni el redirect de `/`**: son los scripts con hash de la CSP.
- **Links de contacto** — `src/data/contact.ts` es la única fuente del teléfono y el email: `waLink(message)` (WhatsApp con mensaje precargado) y `mailtoLink(subject)` (email con asunto). Lo usan el botón flotante de `Layout`, `Hero` y `Contact`. El copy vive **una sola vez** en i18n: `layout.whatsappMessage` (mensaje de WhatsApp, global) y `contact.emailSubject`; `Hero` y `Contact` lo reciben como prop `waMessage` desde la página. Los iconos del `Footer` siguen con `wa.me` pelado (fila de iconos, sin texto).
