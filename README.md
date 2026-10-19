# Julián Recarte - FullStack Web Developer Portfolio

## 🎯 Proyecto

Portfolio web moderno y altamente visual de Julián Recarte, Desarrollador web FullStack. Multi-idioma (ES/EN/IT) con animaciones fluidas, scroll suave y diseño responsive. Incluye páginas de *case study* por proyecto.

## 🛠️ Stack Tecnológico

- **Framework:** Astro 4.15
- **Estilos:** TailwindCSS 3.4
- **Animaciones:** GSAP 3.12 (ScrollTrigger)
- **Scroll Suave:** Lenis
- **Tipografía:** Outfit (display) + Satoshi (body)
- **Testing:** Vitest + Happy DOM
- **Utilidades:** autoprefixer, postcss, @astrojs/sitemap
- **Deploy:** Vercel (`julianrecarte.dev`)

## 📁 Estructura de Carpetas

```
julianRecarte/
├── src/
│   ├── layouts/
│   │   └── Layout.astro           # Shell: head, SEO, fonts, dark mode, lifecycle
│   ├── pages/
│   │   ├── index.astro            # Redirección por idioma (detecta navegador)
│   │   └── [lang]/
│   │       ├── index.astro        # Página principal multi-idioma
│   │       ├── sobre-mi.astro     # Página "Sobre mí"
│   │       └── proyectos/
│   │           └── [slug].astro   # Case study por proyecto
│   ├── components/
│   │   ├── Nav.astro              # Navegación + overlay mobile
│   │   ├── Hero.astro             # Hero con animación zap
│   │   ├── Soluciones.astro       # Servicios en lista editorial
│   │   ├── AboutTeaser.astro      # Teaser de "Sobre mí" en la home
│   │   ├── Button.astro           # CTA único (primary / accent / outline)
│   │   ├── Projects.astro         # Grid/carrusel de proyectos
│   │   ├── ProjectCard.astro      # Card con tilt 3D
│   │   ├── CaseStudy.astro        # Página de caso de estudio
│   │   ├── Process.astro
│   │   ├── Testimonials.astro     # Carrusel de testimonios
│   │   ├── Contact.astro
│   │   ├── Footer.astro
│   │   ├── SectionHeader.astro    # Encabezado reutilizable
│   │   ├── Waves.astro            # Olas SVG
│   │   ├── Logo.astro
│   │   ├── LangSelector.astro     # Selector de idioma
│   │   └── WhatsAppIcon.astro
│   ├── data/
│   │   ├── projects.ts            # Metadatos e imágenes de proyectos
│   │   ├── project-content.ts     # Resuelve copy por slug (falla en dev)
│   │   ├── process.ts             # Pasos del proceso
│   │   ├── contact.ts             # Teléfono, email y links de contacto
│   │   └── schema.ts              # Builders de JSON-LD
│   ├── scripts/                   # Módulos TS con ciclo de vida
│   │   ├── component.ts           # primitivo defineComponent (scope + cleanup)
│   │   ├── lifecycle.ts           # createLifecycle (ViewTransitions)
│   │   ├── main.ts                # Orquestador global
│   │   ├── gsap-factory.ts        # defineAnimation (GSAP contextual)
│   │   ├── scroll-source.ts       # Bus de eventos de scroll
│   │   ├── lenis-adapter.ts       # Adaptador Lenis
│   │   ├── nav.ts                 # Nav completa en un módulo
│   │   ├── reveal-observer.ts     # Fade-in por scroll
│   │   ├── back-to-top.ts         # Botón volver arriba con partículas
│   │   ├── testimonials-carousel.ts · projects-carousel.ts
│   │   ├── animations.ts · hero-scroll.ts · hero-zap.ts
│   │   ├── cine-text.ts · magnetic.ts · card-tilt.ts · waves.ts
│   │   ├── soluciones-lines.ts · about-parallax.ts · about-intro.ts
│   │   └── *.test.ts              # Pruebas unitarias
│   ├── styles/
│   │   └── globals.css
│   └── i18n/
│       ├── es.json · en.json · it.json
│       └── safe-t.ts              # Proxy de traducción tolerante
├── public/
├── astro.config.mjs
├── tailwind.config.mjs
├── tsconfig.json
├── vitest.config.ts
└── package.json
```

## 🚀 Instalación y Desarrollo

```bash
npm install
npm run dev       # http://localhost:4321/
npm run build     # salida en dist/
npm run preview   # preview de producción
npm test          # corre Vitest
```

## 🎨 Identidad Visual

### Colores

- **Fondo claro:** `#E8E0D0` (beige)
- **Fondo dark:** `#1C1A18`
- **Texto:** `#1A1613` (claro) · `#F0F0F0` (oscuro)
- **Accent:** naranja `#FF5C2B` · warm `#FF7A4F` · pastel `#FFB088` (solo cálidos)
- **Texto naranja:** `#B33A0E` (chico) · `#D2491A` (grande), por contraste AA

### Tipografía

- **Display:** Outfit (variable, `wght` 500..700 — títulos a `500`)
- **Body:** Satoshi (400, 500, 400 itálica)

## 🎬 Características

- ✅ Scroll suave con Lenis + bus de scroll (`scroll-source`)
- ✅ Animaciones GSAP (scroll-driven, reveal, stagger, contextuales)
- ✅ Primitivo de ciclo de vida `defineComponent` (scope + cleanup centralizado)
- ✅ Nav en un módulo único (theme, auto-hide, active-section, overlay, idioma)
- ✅ Multi-idioma (ES/EN/IT) + case studies por proyecto
- ✅ Dark mode persistente
- ✅ SEO (sitemap, JSON-LD, hreflang)
- ✅ Pruebas unitarias con Vitest + Happy DOM
- ✅ Responsive design con Tailwind
- ✅ Desplegado en Vercel — julianrecarte.dev
## 📧 Contacto

Julián Recarte, Desarrollador web FullStack: [julianrecarte.dev](https://julianrecarte.dev/)

## 📚 Documentación

- [AGENTS.md](AGENTS.md): arquitectura, convenciones y problemas conocidos.
- [docs/](docs/): marca, páginas, SEO y pendientes.
