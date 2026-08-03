# Mejoras — julianRecarte portfolio

## 🔴 Alta prioridad

### 1. Hero desktop image sin width/height — CLS
`src/components/Hero.astro:99-105`

El `<Image>` del hero desktop no tiene `width` ni `height`. El mobile sí los tiene (`width={1024} height={1536}`). El navegador no puede reservar espacio antes de que cargue la imagen → CLS. También falta `decoding="async"` en desktop (presente en mobile).

### 2. Aria-label de dots hardcodeado en español
`src/components/Testimonials.astro:84`

`aria-label={`Ir al testimonio ${i + 1}`}` sin traducción. Debería usar una key de i18n.

### 3. Opacity transition rota en testimonio activo
`src/components/Testimonials.astro` — bloque `<style>` ~línea 97

`.card-active` setea `transition: transform var(--dur-slow) ease;` (solo transform, sin opacity). Cuando un card se activa, su opacity pasa de 0 a 1 instantáneamente en vez de transicionar suave. Los `.card-peek-*` heredan el inline de Tailwind que sí incluye opacity.

### 4. `screenshots` en projects.ts nunca se usa
`src/data/projects.ts:16`

El campo `screenshots: ImageMetadata[]` está definido en la interface y populado con 4 imports y arrays vacíos, pero ningún template lo referencia. Data muerta. Los archivos de imagen en `src/assets/images/` deberían mantenerse o limpiarse según criterio.

---

## 🟡 Media prioridad

### 5. Aspect ratio hint incorrecto en Logo
`src/components/Logo.astro:23,30`

`<img width={200} height={200}>` en SVGs que probablemente no son 1:1. El navegador reserva 200×200 antes de que cargue CSS, y cuando CSS aplica `h-12 w-auto` la imagen se reajusta → layout shift. Usar dimensiones reales del SVG o sacar width/height ya que `w-auto` usa el tamaño intrínseco.

### 6. Label de SectionHeader también recibe character stagger
`src/components/SectionHeader.astro:17`

El `<span>` del label (texto chico tipo "Proyectos") se envuelve en `<span class="cine-char">` por cine-text porque tiene `data-reveal-heading`. No es un bug funcional pero visualmente queda raro en labels chicos.

### 7. Sin preload de hero image
`src/layouts/Layout.astro`

No hay `<link rel="preload">` para `yo.webp`. Aunque `loading="eager"` ayuda, un preload en `<head>` mejoraría LCP.

### 8. Sin manualChunks en build
`astro.config.mjs`

GSAP (~60KB gzipped) y Lenis (~10KB) van en el mismo bundle que el código de la app. Separarlos con `vite.build.rollupOptions.output.manualChunks` mejoraría caching.

---

## 🟢 Baja prioridad

### 9. `clearListeners()` exportada pero nunca llamada
`src/scripts/scroll-source.ts:24`

Función muerta. Además no hay safety net si un módulo olvida desuscribirse en destroy.

### 10. `gsap.ticker.lagSmoothing(0)` global
`src/scripts/lenis-adapter.ts:26`

Desactiva lag smoothing para TODAS las animaciones GSAP, no solo scroll. Si se agregan animaciones no-scroll, tendrán lag smoothing desactivado.

### 11. `isMobile` no se actualiza al redimensionar
`src/scripts/hero-scroll.ts:8`

El breakpoint se calcula una vez al init. Si el usuario redimensiona, no se actualiza. Debería usar `matchMedia` o resize listener.

### 12. Riesgo de listeners duplicados en lifecycle
`src/scripts/lifecycle.ts`

Si Astro re-ejecuta el `<script>` tag de Layout.astro o Nav.astro, nuevos listeners se agregan sin remover los viejos. `destroy()` se llamaría múltiples veces.

### 13. `!` assertions engañosas
`src/scripts/back-to-top.ts:7-9` y `src/scripts/testimonials-carousel.ts:18-20`

Usan `document.getElementById("...")!` pero después checkean null con `if (!el) return;`. TypeScript cree que no es null, el código checkea igual.

### 14. `items-stretch` redundante en Nav
`src/components/Nav.astro:32`

Es el valor por defecto de flex.

### 15. `block no-underline` redundante en ProjectCard
`src/components/ProjectCard.astro:18`

`<article>` ya es `display: block` y `no-underline` solo aplica a links.

### 16. Líneas en blanco al inicio de Waves.astro

### 17. Proxy de safe-t.ts envuelve arrays
`src/i18n/safe-t.ts`

El Proxy recursivo se aplica a objetos y arrays. Funciona con los patrones actuales (`t.items.map(...)`, `t.items[i]`), pero métodos como `filter()` o `slice()` devuelven arrays sin wrap.
