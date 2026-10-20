# Sistema de marca y tipografía

> Detalle del sistema visual: paleta, contraste, botón, líneas/sombras/radios, roles tipográficos y carga de fuentes. Volver a [AGENTS.md](../AGENTS.md).

## Marca

Fuente única: tokens en `tailwind.config.mjs` + `globals.css`. Auditado contra todo `src/`; las reglas de abajo son las que el código cumple hoy.

### Paleta: solo cálidos

| Token | Valor | Uso |
|---|---|---|
| `bg-hex` (var) | `#E8E0D0` / `#1C1A18` | Fondo (cambia con el tema) |
| `copy` | `#1A1613` | Texto primario en claro, label de los CTA, superficie de la banda invertida |
| `dark.card` / `dark.copy` / `dark.muted` | `#252525` / `#F0F0F0` / `#A8A8A8` | Tema oscuro |
| `accent.orange` / `warm` / `pastel` | `#FF5C2B` / `#FF7A4F` / `#FFB088` | **Superficies**: CTA, sol, íconos, bordes de acento, glows |
| `accent.ink` (var) | `#B33A0E` → orange en oscuro | **Texto chico** en naranja |
| `accent.deep` (var) | `#D2491A` → orange en oscuro | **Texto grande** (≥ 24px) en naranja |

- **El violeta (`#5B1FFF`) se eliminó** (token incluido). Barra de progreso, orb del hero, olas, glow del zap y avatares pasaron a naranja/warm/pastel. No reintroducir acentos fríos.
- **Sin hex en componentes.** Usar clases o `theme("colors.x")` dentro de `<style>`. Excepciones: `<meta name="theme-color">` y el `style` del redirect de `/` (no pueden leer variables), y los colores propios de cada proyecto (`--project-accent` del case study) y las banderitas de la tarjeta "Idiomas" de /sobre-mi (`--flag-art`).

### Tinta naranja (contraste AA)

`#FF5C2B` sobre el beige da **2.35:1**: no sirve como texto, ni siquiera grande.

| Par | Contraste |
|---|---|
| `ink` / beige | 4.54 ✓ (texto chico) |
| `deep` / beige | 3.40 ✓ (texto ≥ 24px) |
| `orange` / `#1C1A18` | 5.63 ✓ (por eso en oscuro la tinta vuelve al naranja) |
| `copy` / orange · `copy` / pastel | 5.84 · 10.12 ✓ (label de CTA) |
| blanco / orange · blanco / pastel | 3.08 · 1.78 ✗ (por eso los CTA ya no van en blanco) |

- `ink` y `deep` son **variables** (`--clr-accent-ink` / `--clr-accent-deep`), no hex: en `:root.dark` y dentro de `.surface-ink` (superficies oscuras en tema claro, p. ej. `.about-band`) valen `--clr-accent-orange`. No hace falta `dark:` en cada uso. Como son variables, **no aceptan modificador de opacidad** (`text-accent-ink/80` no genera nada).
- Texto chico (eyebrows, links, `t-link-quiet`, label del CTA `accent`, hovers de texto, link activo del nav, índice abierto del FAQ) → `text-accent-ink`.
- Palabra destacada de H1/H2 (`SectionHeader`, Hero, /sobre-mi), H3 de `ProjectCard` y stats del bento → `text-accent-deep`.
- `.label-outline` pinta el trazo con `--clr-accent-ink`.
- Íconos decorativos `aria-hidden` (estrellas, ✦, `+` del FAQ, íconos del bento) siguen en `text-accent-orange`.
- Hover de un link de texto: **no** cambiar a otro color de acento. Subrayado (`hover:underline`) o flecha que se desplaza.

### Botón: `Button.astro`

Único lugar donde viven los CTA (`href`, `variant`, `external`, `magnetic` = true, `class`, slot para ícono + texto). Todas las variantes llevan `t-label`, `px-6 py-3 md:px-8 md:py-4`, `rounded-full` y `whitespace-nowrap`.

| Variante | Aspecto | Uso |
|---|---|---|
| `primary` | Gradiente `orange → pastel` + label `text-copy` + `shadow-lg` | Acción principal (WhatsApp, "Ver proyectos", "Hablemos") |
| `accent` | Borde gradiente (`.wa-btn`) + label `text-accent-ink`; al hover se rellena y el label pasa a `text-copy` | Acción secundaria junto a un primario |
| `outline` | Borde `.line-control` + `text-copy/80`; hover a tinta | Acciones terciarias (email, Instagram) |

Fuera de `Button` quedan solo controles que no son CTA de página: el pill "Ver sitio" de `ProjectCard`, los ítems del menú mobile (`bg-accent-orange` + `text-copy`) y los botones redondos de ícono (flechas, flotantes, redes del footer).

### Líneas, sombras, radios y contenedor

- **Líneas (2 roles)** en `@layer components`: `.line-hair` (`black/8%` · oscuro `dark-muted/20%`) para separadores, bordes de tarjeta, banda y footer; `.line-control` (`black/20%` · `dark-muted/30%`) para botones con borde. Se usan con `border` / `border-t` / `border-y` (`border line-hair`). Los separadores de 1px pintados con fondo (`h-px bg-black/[0.08]`) equivalen a `hair`.
- **Sombras:** `shadow-card` → `hover:shadow-card-hover` en tarjetas (Projects, Process); `shadow-lg` en CTA y flotantes; `shadow-md` en controles chicos; `shadow-xl` en retrato y tarjeta de testimonio. Nada de `shadow-[…]` arbitrarias.
- **Radios:** `rounded-full` para todo control (botones, pills, selector de idioma, skip link) y `rounded-2xl` para tarjetas. Las excepciones son intencionales: `rounded-[2rem]` en el retrato del hero y `rounded-[1.75rem]` en la tarjeta de testimonio.
- **Contenedor:** `max-w-7xl mx-auto` en toda sección de layout (= Nav y Footer, así el contenido arranca alineado con el logo en todas las páginas). Las columnas de **lectura** usan `max-w-3xl` / `2xl` / `xl` (FAQ, AboutTeaser, Testimonios, párrafos). No usar `5xl`/`6xl`.

## Sistema tipográfico: roles en `globals.css`

La escala vive en `src/styles/globals.css` como **tokens** (`--fs-*`, `--lh-*`, `--tr-*`) + **15 clases de rol** dentro de `@layer components`. Un rol fija **tamaño + interlineado + tracking (+ uppercase)**; el **color y el peso quedan siempre en utilidades** de Tailwind.

| Rol | Uso | Móvil → `md:` |
|---|---|---|
| `.t-eyebrow` | Label sobre un título de sección | 14px, 500, `.3em`, uppercase |
| `.t-index` | Contador editorial (01, 02) | 12px, 500, `.22em`, tabular |
| `.t-h1` | Título de página (Hero, `/sobre-mi`) | 2.5rem → 3rem → `lg:` 3.75rem |
| `.t-h2` | Título de sección y de página interior | 2.25rem → 3rem |
| `.t-h3` | Título de ítem (card, servicio) y H1 del case study | 1.5rem → 1.875rem |
| `.t-h4` | Título chico (autor, paso) | 1.125rem → 1.25rem |
| `.t-feature` | Título de panel (timeline de Proceso) | 1.875rem → 2.25rem |
| `.t-lead` | Párrafo de entrada | 1.125rem → 1.25rem |
| `.t-body` | Párrafo descriptivo | 0.875rem → 1rem |
| `.t-body-lg` | Párrafo largo / cita / subtítulo | 1rem → 1.125rem |
| `.t-meta` | Texto secundario | 0.875rem |
| `.t-label` | Label de botón / pill | 0.875rem → 1rem, 500, `.05em`, uppercase |
| `.t-badge` | Badge de estado | 0.75rem, 500, `.05em`, uppercase |
| `.t-link` | Link de nav / footer | 0.875rem, `.1em`, uppercase |
| `.t-link-quiet` | Link dentro de contenido (volver, caso de estudio) | 0.875rem, `.05em`, uppercase |

**Reglas de color** (utilidades, solo 3 valores + primario):

| Tono | Clase | Uso |
|---|---|---|
| Primario | `text-copy dark:text-dark-copy` | títulos, valores |
| Secundario | `text-copy/70 dark:text-dark-muted` | body, lead, meta, citas |
| Link/UI | `text-copy/80 dark:text-dark-copy` | nav, footer, contacto |
| Decorativo | `text-copy/30 dark:text-dark-muted/40` | índices `aria-hidden` |

- `/70` en claro ≈ 5.5:1 y `dark-muted` en oscuro ≈ 4.9:1 → **AA en ambos temas**. Un `/60` en claro da 4.0:1 (falla AA); no usar.
- **El H1 del case study no puede crecer**: su columna de texto mide ~276px a 1024px de ancho (grid `lg:grid-cols-[1fr_660px]`, columna de mockup fija en 660px) y "Multiservizi" a 3rem ocupa ~300px → desborda. Por eso queda en `.t-h3` (su tamaño histórico). Para subirlo hay que **ensanchar la columna** (o rearmar el hero en dos filas), no cambiar el rol. Ya **no** es un problema de alto: la página scrollea (ver [docs/paginas.md](paginas.md)).
- Los roles van en `@layer components`, así que **cualquier utilidad de Tailwind los sobrescribe**. Si un elemento conserva un `md:text-lg` suelto, esa utilidad gana y el rol queda muerto: al asignar un rol hay que **quitar** sus utilidades de tamaño/interlineado/tracking.
- `h1`–`h6` llevan `font-weight: 500` + `line-height: var(--lh-heading)` (1.25) como red de seguridad en `globals.css`; los headings sin `leading-*` ya no heredan el 1.6 del body.
- Los `font-bold` que quedan son **solo** los H3 de Soluciones (Outfit 700, `text-accent-deep` sólido). Todo lo demás es 500.
- **Nada de texto con gradiente recortado** (`bg-clip-text` + `text-transparent`) sobre colores que son variables (`accent-ink`/`deep`): Chrome puede no repintar el fondo cuando la variable cambia (tema, ViewTransitions) y el texto queda **invisible pero seleccionable**. Le pasó a "Presencia / Catálogo / Venta"; por eso hoy son color sólido.

## Fuentes

### Self-hosted en `public/fonts/` (no CDN)

Las 4 caras se sirven desde el mismo origen; los `@font-face` están al inicio de `globals.css`. Antes venían de Fontshare y Google Fonts, y esas dos hojas externas bloqueaban el render: en mobile el primer pintado esperaba ~1 s más (PageSpeed mobile 67 → ~94 al mudarlas).

| Archivo | Familia | Uso |
|---|---|---|
| `satoshi-400.woff2` | Satoshi 400 | Texto (precargada en `Layout.astro`) |
| `satoshi-400-italic.woff2` | Satoshi 400 itálica | CTA del hero y citas |
| `satoshi-500.woff2` | Satoshi 500 | Énfasis |
| `outfit-latin.woff2` | Outfit variable 500–700, subset latin | `h1`–`h6` (precargada) |

- **Satoshi no tiene 600**: `font-semibold` se resolvería como negrita sintética. El sistema es **400 = texto, 500 = énfasis**; el 700 solo existe en Outfit (H3 de Soluciones). Si hace falta otra cara, bajarla de Fontshare (`https://api.fontshare.com/v2/css?f[]=satoshi@<peso>`; itálicas con sufijo `i`, p. ej. `400i`) y sumar su `@font-face`.
- **Outfit solo trae el subset latin** (cubre es/en/it, incluidas tildes y ñ). Se bajó del CSS de Google Fonts (`family=Outfit:wght@500..700`); su `unicode-range` se copió tal cual.
- **Caché:** `vercel.json` sirve `/fonts/*` con `max-age=31536000, immutable`. Los nombres no llevan hash, así que **si se reemplaza un archivo hay que renombrarlo** (y actualizar `@font-face` + preload).
- **Preload:** solo las dos del primer pantallazo. Precargar las demás compite con la imagen LCP.
