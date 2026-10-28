# SEO, GEO y analytics

> Volver a [AGENTS.md](../AGENTS.md).

## Archivos

- **`public/llms.txt`:** resumen citable para LLMs (quién, servicios, contacto, URLs). Enlazado desde `robots.txt`.
- **`public/robots.txt`:** `Allow` explícito para los crawlers de IA (GPTBot, ClaudeBot, PerplexityBot, Google-Extended, etc.) + sitemap.
- **Imágenes OG** (1200×630): `og-cover`, `og-triba`, `og-multiservizi`. Se generan con `npm run og` (local, no corre en el build).
- **Sitemap:** excluye `/`, que es solo un redirect (308 en `vercel.json`, `noindex`), para evitar el conflicto de hreflang. `x-default` apunta al idioma por defecto.

## JSON-LD (`src/data/schema.ts`)

- `Layout` siempre emite `Person` (`@id` = `/#person`, con `sameAs` sin `wa.me`). Cada página suma nodos con la prop `schema`.
- Case studies: `Article` con `datePublished` desde `projects.ts` y `dateModified` = fecha de build.
- `/sobre-mi`: `AboutPage`, `FAQPage` (FAQ visible), `ProfessionalService` y `BreadcrumbList`.

## Meta description

`layout.description` (home) y `about.metaDescription`. **Empiezan con "Julián Recarte"** y tienen ~140–160 caracteres con rol, servicios y stack. Si no contiene lo que se buscó, Google la reemplaza: con la anterior mostraba un testimonio al buscar el nombre. Después de cambiarla, pedir reindexación en Search Console.

## Headers y CSP (`vercel.json`)

HSTS, `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy` y CSP:

- `script-src 'self'` + hashes + googletagmanager. `style-src` necesita `'unsafe-inline'` por el CSS inline. `font-src 'self'`. `connect-src` hacia GA y Vercel Insights. `frame-ancestors 'none'`.
- Los **hashes** cubren los 2 únicos scripts inline: el bootstrap de dark mode y el redirect de `/`. Si se toca alguno, el script se bloquea en silencio (dark mode parpadea, `/` no redirige). Recalcular así:
  ```bash
  npm run build && node -e "
  const fs=require('fs'),crypto=require('crypto');
  const h=fs.readFileSync('dist/es/index.html','utf8');
  for(const m of h.matchAll(/<script(?![^>]*\bsrc=)(?![^>]*ld\+json)[^>]*>([\s\S]*?)<\/script>/g))
    console.log('sha256-'+crypto.createHash('sha256').update(m[1],'utf8').digest('base64'));
  "
  ```
- No necesitan hash: el snippet de gtag (Astro lo bundlea), los `ld+json` (son datos) ni Speed Insights (`/_vercel/...`, mismo origen).

## Analytics

- **Speed Insights:** `<SpeedInsights />` en `Layout`; no requiere configuración.
- **GA4 (`G-R1ZPHT8LX2`):** `gtag.js` se inyecta después del `load`. El módulo corre una sola vez, así que emite `page_view` en cada `astro:page-load`. Un flag `firstLoad` descarta la carga inicial, que ya cuenta `gtag('config')`; sin él cada visita contaría doble.
- **Mensajes de contacto:** el texto de WhatsApp (`layout.whatsappMessage`) y el asunto del email (`contact.emailSubject`) viven una sola vez en i18n. Los íconos del footer usan `wa.me` sin mensaje.
