# Mejoras — Portfolio Julián Recarte

## ✅ Completadas

| # | Mejora | Archivos |
|---|---|---|
| 1 | Gradients de steps aplicados al fondo de imágenes | `Process.astro` |
| 2 | `viewProject` como prop directa (sin objeto `t` anidado) | `ProjectCard.astro`, `Projects.astro` |
| 3 | Variables CSS de timing (`--dur-fast`, `--dur-base`, `--dur-slow`) | `Layout.astro` |
| 4 | `--theme-dur` reducido: 2s → 1.5s → 0.6s | `Layout.astro` |
| 5 | Transiciones en Cursor y Nav dropdowns unificadas con vars | `Cursor.astro`, `Nav.astro` |
| 6 | Indicador de sección activa en el nav (IntersectionObserver) | `Nav.astro` |
| 7 | Colores hardcodeados migrados a tokens/variables CSS | `tailwind.config.mjs`, `Layout.astro`, `Waves.astro`, `Nav.astro`, `Cursor.astro`, `Process.astro`, `Projects.astro`, `Hero.astro` |
| 8 | GSAP: imports duplicados eliminados (ProjectCard → dinámico) | `ProjectCard.astro` |
| 9 | Scripts de Nav.astro unificados (3 → 1 bloque) | `Nav.astro` |
| 10 | Lazy loading en imágenes del proceso | `Process.astro` |
| 11 | `py-32` reducido a `py-16 md:py-32` en mobile | `Hero.astro`, `Projects.astro`, `Process.astro`, `Contact.astro` |
| 12 | Hover delay del cursor: 0.5s → 0.3s (size) / 0.3s → 0.15s (color) | `Cursor.astro` |
| 13 | Footer copyright con fallback `(t.copyright \|\| "...")` | `Footer.astro` |
| 14 | Estructura para foto en Hero (lado derecho, placeholder con pulse) | `Hero.astro` |
| 15 | Loading state con wipe reveal (clip-path) | `Layout.astro` |
| 16 | Sección Testimonios creada con placeholder data (es/en/it) | `Testimonios.astro`, i18n, `[lang]/index.astro` |
| 17 | Colores hardcodeados en borde gradient del CTA | `Hero.astro` |
| 18 | Responsive: gaps reducidos en mobile, texto escala mejor | `Projects.astro`, `Process.astro`, `Contact.astro` |

## ⏳ Pendientes

| # | Ítem | Depende de |
|---|---|---|
| 1 | Links de contacto (WhatsApp, Instagram, Email) | Datos del usuario |

## 📝 Notas adicionales

- **GSAP en Waves.astro**: ya usa `await import("gsap")` dinámico → óptimo
- **Sección "Sobre mí"**: descartada por ahora (se usará Hero para eso)
- **Transición de entrada (loading state)**: implementada como wipe reveal con clip-path
- Cuando se agreguen imágenes reales a Proyectos y al Hero, mantener hover overlay, tilt 3D y efecto de aparición
