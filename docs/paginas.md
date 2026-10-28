# Páginas y secciones

> Decisiones de layout que no se deducen del código. Las reglas generales están en [AGENTS.md](../AGENTS.md).

## Soluciones (home)

- Lista editorial sin cards, a propósito: no repetir `ProjectCard` ni `Testimonials`.
- `grid-cols-[300px_1fr]` + separadores `[data-solu-line]` en `max-w-7xl`. Cierra con un hint en itálica y un único `Button` primario.
- **4 niveles con precio "Desde"** (USD, iguales en es/en/it): Landing 200 · Sitio web 400 · Web a medida 800 · Plataforma 1.300. El monto va a la derecha de la descripción (debajo en mobile) y una nota chica (`currencyNote`, `t-meta`) aclara que otra moneda usa el cambio del momento. Al cambiar un precio hay que tocar los 3 JSON **y** `public/llms.txt`; el JSON-LD no lleva precios.
- El `id="soluciones"` está en el `IntersectionObserver` de `nav.ts`.

## /sobre-mi

Solo su propio contenido; para el resto se vuelve a la home.

- **No tiene** Servicios, Proceso ni `<Contact />`: duplicaban la home. Cierra con una banda CTA **sin `id="contacto"`**, para que el nav no le robe el `active` a "Sobre mí" (`nav.ts` lo marca por ruta).
- **Orden:** Hero → banda de stack → En resumen (bento) → Cómo trabajo → FAQ → Cierre.
- **Hero:** solo texto, centrado (`max-w-3xl`), sobre el wash `about-wash`. Sin retrato por ahora (la foto actual se descartó; `sobreMi.webp` queda en `assets`). Sin eyebrow: el rol va en un `<p class="sr-only">`. H1 "Sobre **mí**" sin el nombre: el `<title>` ya lo trae. Cuando vuelva una foto, se rearma en dos columnas y `about-parallax.ts` / `about-intro.ts` ya la toman por `data-about-portrait` / `data-about-reveal`.
- **Consistencia con el resto del sitio:** las tarjetas del bento usan lo mismo que `ProjectCard` (`bg-white/50 dark:bg-dark-card/50`, `line-hair`, `shadow-card` → `hover:shadow-card-hover`), sin tintes por tarjeta; "Cómo trabajo" repite el patrón de Soluciones (`t-h3 font-bold text-accent-deep`, `grid-cols-[300px_1fr]`); todos los `SectionHeader` van centrados; el glow del cierre es el mismo que el de `Contact`.
- **Banda de stack:** ticker CSS con dos grupos idénticos y `translateX(-50%)`. El espaciado va como `px-3` en cada `<li>` y **no** como `gap`, porque si no el −50% no coincide y el loop salta. `about-intro.ts` acelera la animación con la velocidad del scroll.
- **Bento:** las tarjetas 1 y 4 son `md:col-span-2`. Todas comparten anatomía (cabecera arriba, `dd` con `mt-auto`), así que en cada fila arrancan y cierran a la misma altura. Los tintes alternan para que dos vecinas no repitan tono.
- **Banderitas de Idiomas:** solo CSS (`:has()` + `tabindex="0"`; en mobile el toque enfoca). Los chips se asocian a es/en/it por índice, así que el orden tiene que ser el mismo en los 3 JSON. Español = Argentina.
- **Cómo trabajo:** banda invertida `.about-band surface-ink`, con los hijos en colores fijos del tema oscuro.
- **FAQ:** `<details>` con altura animada por `::details-content` + `interpolate-size`. Es mejora progresiva: sin soporte, abre en seco.

## SectionFade

Fundido de 128px (`--section-fade-h`) entre el hero sticky y Soluciones: `Hero` lleva el borde inferior y `Soluciones` el superior. Existe solo para el hero sticky; no extenderlo a otras secciones.

## Case studies

- `[lang]/proyectos/[slug].astro`. Triba y Multiservizi están live (el logo linkea a `liveUrl`); SP es `comingSoon`. En las cards, los live van primero.
- **Página con scroll normal.** Antes estaba bloqueada a `100dvh` y en viewports bajos, con zoom o en en/it el contenido se recortaba sin aviso. No volver a bloquearla.
- El mockup va a tamaño natural (`w-full h-auto`). El botón "volver" es `absolute` para no quedar debajo del nav fijo.
- El H1 queda en `.t-h3` por el ancho de la columna (ver [marca.md](marca.md)).
