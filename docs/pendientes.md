# Pendientes

> Lo que sigue vigente de las auditorías de septiembre y octubre de 2026 (`analisis-qa-total.md` y `mejoras.md`, ya borradas; están en el historial de git), verificado contra el código. Al resolver un ítem, borrarlo de esta lista. Volver a [AGENTS.md](../AGENTS.md).

## Bugs

- **El hero de la home queda pegado con movimiento reducido.** El hero es `sticky` y su salida la hace `hero-scroll.ts` vía `defineAnimation`, que no corre con `prefers-reduced-motion`. Resultado: queda detrás de todas las secciones, que no tienen fondo propio. Falta un fallback CSS, por ejemplo `position: relative` en el hero bajo esa media query.

## Copy e i18n

- `about.principles`, "Detalle en cada píxel": todavía menciona "Tipografía", que Julián considera obvia.
- `nav.projects` dice "Portfolio" en es/it (anglicismo): ¿"Proyectos" / "Progetti"?
- `testimonials.carouselLabel` en it: "Carousel di testimonianze" → "Carosello di testimonianze".
- `footer.copyright` es "© {year}", sin nombre.
- Case studies: falta confirmar el stack de cada proyecto (`projects.ts`) y si los resultados de Triba tienen métricas reales.

## UX

- Nav sin CTA persistente en desktop ("Hablemos" → `#contacto`).
- Hero de la home sin indicador de scroll.
- Contacto sin "copiar email".
- `SectionHeader`: el label chico también recibe el stagger por letra de `cine-text`, y en labels chicos se ve raro.

## Código

- `scroll-source.ts`: `clearListeners()` está exportada y nunca se llama. Usarla como red de seguridad en `destroyAll` o borrarla.
- `lenis-adapter.ts`: `gsap.ticker.lagSmoothing(0)` es global, así que afecta también a las animaciones que no son de scroll.
- `testimonials-carousel.ts` / `projects-carousel.ts`: hacen `getElementById(...)!` y después chequean null igual. Sacar el `!`.
- `ProjectCard.astro`: la prop `accent` se recibe y no se usa.
- `projects.ts`: `screenshots` solo alimenta el `og:image` del case study (no hay galería). `tabletHorizontal.webp` no se importa en ningún lado.
- `Logo.astro`: `width/height="200"` en SVGs que no son cuadrados, lo que puede dar layout shift.
- `hero-zap.ts`: el glitch sigue corriendo con la pestaña oculta o el hero fuera de vista. Falta `IntersectionObserver` o `visibilitychange`.
- `back-to-top.ts`: los `setTimeout` no se cancelan en `destroy`.
- `safe-t.ts`: el Proxy envuelve arrays, así que `filter`/`slice` devuelven arrays sin proxy.
- Detalles menores: `items-stretch` redundante en `Nav.astro` y líneas en blanco al inicio de `Waves.astro`.

## Toolchain y tests

- Astro 4 → 5 y Tailwind 3 → 4, en una rama aparte.
- Sin scripts `lint` / `typecheck` (`astro check`) ni ESLint.
- Tests faltantes: `scroll-source`, `gsap-factory`, `safe-t` y paridad de claves i18n entre es/en/it.

## SEO y medición

- IndexNow.
- Eventos de embudo en GA4 (clic a WhatsApp / email / caso de estudio, con `lang` y `source`).
- CSP con nonce en lugar de hashes.
- Contenido citable extra (notas o blog).
