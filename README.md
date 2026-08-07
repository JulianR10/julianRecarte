# Julián Recarte - FullStack Web Developer Portfolio

## 🎯 Proyecto

Portfolio web moderno y altamente visual de Julián Recarte, Desarrollador web FullStack. Multi-idioma (ES/EN/IT) con animaciones fluidas, scroll suave y diseño responsive. Incluye páginas de *case study* por proyecto.

## 🛠️ Stack Tecnológico

- **Framework:** Astro 4.15
- **Estilos:** TailwindCSS 3.4
- **Animaciones:** GSAP 3.12 (ScrollTrigger)
- **Scroll Suave:** Lenis
- **Tipografía:** Mozilla Headline (display) + Satoshi (body)
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
│   │       └── proyectos/
│   │           └── [slug].astro   # Case study por proyecto
│   ├── components/
│   │   ├── Nav.astro              # Navegación + overlay mobile
│   │   ├── Hero.astro             # Hero con animación zap
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
│   │   ├── WhatsAppIcon.astro
│   │   └── flags/                 # Banderas ES/EN/IT
│   ├── data/
│   │   ├── projects.ts            # Metadatos e imágenes de proyectos
│   │   ├── project-content.ts     # Resuelve copy por slug (falla en dev)
│   │   └── process.ts             # Pasos del proceso
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
- **Accent:** naranja `#FF5C2B` · pastel `#FFB088` · morado `#5B1FFF`

### Tipografía
- **Display:** Mozilla Headline (width comprimible)
- **Body:** Satoshi (400, 500, 700)

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

Julián Recarte - Desarrollador web FullStack
