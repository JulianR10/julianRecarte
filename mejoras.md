# Análisis completo — Portfolio Julián Recarte

> Análisis realizado el 24 de junio de 2026. Código base en `27ef55b`.
> Última actualización: 24 de junio de 2026.

---

## Estado actual

### ✅ Resuelto en esta sesión

| # | Problema | Resolución |
|---|----------|------------|
| 1 | **Preloader no arranca** | Safety timeout movido fuera del `load` event; `showPage()` reemplazado por lógica inline; `[data-nav-logo]` en lugar de CSS path frágil; `navLogo` opacity 0→1 |
| 3 | **ProjectCard O(N²)** | Script por instancia eliminado; tilt con event delegation (`document.mousemove`) en Layout.astro — O(1) listeners |
| 4 | `scroll-behavior:smooth` vs Lenis | Eliminado del CSS de `<html>` |
| 5 | **GSAP cargado 4 veces** | `window.gsap = gsap` en Layout.astro; Waves y animaciones usan `window.gsap` |
| 6 | **`[data-reveal-heading]` sin animación en mobile** | IntersectionObserver expandido (data-reveal, data-reveal-heading, data-reveal-stagger) |
| 7 | **Flasheo de contenido invisible** | `<noscript>` fallback inyectado |
| 8-14 | **Atributos muertos** | Eliminados `data-parallax`, `data-split-text`, `data-hero-*`, `data-magnetic`, `data-hoverable`, `html.lenis`, `#page-content` |
| 15 | **Logo componente compartido** | Creado `Logo.astro`; usado en Nav y Footer |
| 16 | **Selector de idioma duplicado** | Refactorizado a `initLangSelector()` factory; desktop y overlay usan la misma función |
| 17 | `#FF5C2B` hardcodeado | Reemplazado por `var(--clr-accent-orange)` en Contact.astro |
| 18 | `path.replace` frágil | Reemplazado por `split("/")` + `findIndex` + `join("/")` — ignora falsos positivos |
| 19 | `rafId` sin cancelar | `cancelAnimationFrame` agregado en `beforeunload` |
| — | **CSS `data-reveal-heading/stagger` bug** | Corregido: solo `[data-reveal]:not(.revealed)` tiene `opacity:0`; heading y stagger container ya no se ocultan |

### ❌ Pendiente para próxima sesión

| # | Problema | Archivo | Detalle |
|---|----------|---------|---------|
| 2 | **Social links placeholder** | `Contact.astro` | WhatsApp, Instagram, Email tienen `href="#"` — necesita URLs reales del usuario |
| 20 | Typing: `Record<string, string>` vs `any` | Varios | Process, Projects, Testimonials usan `any` por tener objetos anidados — bajo impacto |
