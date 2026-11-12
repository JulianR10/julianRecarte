# Pendientes

Mejoras de la revisión general del 2026-11-12, ordenadas por impacto.

## 1. Un solo mockup por caso de estudio
`CaseStudy.astro` renderiza dos `<Image>` (mobile `lg:hidden` y desktop `hidden lg:flex`), ambos `loading="eager"`: cada dispositivo descarga los dos (~125 KB de más por página). Además, el de desktop tiene `sizes="(min-width: 1024px) 660px"` sin valor por defecto.
- Unificar en un `<picture>` con `<source media="(min-width: 1024px)">` y la imagen mobile como fallback.

## 2. Imagen del JSON-LD del artículo
`[slug].astro` usa `project.screenshots[0]?.src ?? project.mockup?.src`, lo que publica originales pesados (Fernando: `mockupDesktopFerDelPino.webp` de 820 KB; Triba: `celuFirme.webp`).
- Usar la OG del proyecto (`/og-<slug>.jpg`, ~35 KB, 1200×630).

## 3. Limpieza de assets y campos sin uso
Antes de borrar, confirmar la lista.
- Sin uso hoy: `sobreMi.webp` (392 KB), `tabletHorizontal.webp`.
- Solo existen por el punto 2: `celuFirme`, `celuGirado`, `tabletVerticalFirme`, `LaptopGirado` y los campos `screenshots` / `heroImage` de `projects.ts`.
- `mockupDesktopFer.webp` (generado): hoy es el mockup mobile de Fernando. Si se pasa a usar `mockupDesktopFerDelPino.webp` también en mobile, borrarlo.

## 4. SEO de los casos de estudio
- Descripciones cortas (63–122 caracteres): llevarlas a ~140–155 en es/en/it.
- Títulos genéricos ("Triba | Julián Recarte"): sumar qué es el proyecto, p. ej. "Triba: revista digital con suscripciones | Julián Recarte".

## 5. Dependencias
- Actualizaciones menores seguras: `@astrojs/sitemap`, `gsap`, `lenis`, `sharp`, `postcss`, `autoprefixer`, `prettier`, `@vercel/speed-insights`, `vitest` (dentro de 4.x).
- `npm audit` marca una vulnerabilidad crítica en Astro ≤ 7.3.1. El riesgo es bajo (sitio estático), pero el fix es migrar de Astro 4 a 7: hacerlo aparte, junto con Tailwind 4 / `@astrojs/tailwind`.

## 6. Errores de tipos (`npx tsc --noEmit`)
- `nav.ts:225-227`: `dd`, `ch`, `ddBtn` "possibly null" dentro de `set()` (el guard está fuera de la closure).
- `waves.ts:22` y `soluciones-lines.ts:9`: `'gsap' is referenced directly or indirectly in its own type annotation`.

## 7. Logo de Triba
`logoTriba.svg` pesa 44 KB: pasarlo por SVGO.
