# Julián Recarte - FullStack Web Developer Portfolio

## 🎯 Proyecto

Portfolio web moderno y altamente visual de Julián Recarte, Desarrollador web FullStack. Multi-idioma (ES/EN/IT) con animaciones fluidas y diseño responsive.

## 🛠️ Stack Tecnológico

- **Framework:** Astro 4.15.0
- **Estilos:** TailwindCSS 3.4.3
- **Animaciones:** GSAP 3.12.2
- **Scroll Suave:** Lenis 1.1.11
- **Tipografía:** Outfit (headings) + Satoshi (body)
- **Utilidades:** autoprefixer, postcss, @astrojs/sitemap

## 📁 Estructura de Carpetas

```
julianRecarte/
├── src/
│   ├── layouts/
│   │   └── Layout.astro              # Layout principal con Lenis, fonts y dark mode
│   ├── pages/
│   │   └── [lang]/
│   │       └── index.astro           # Página principal (multi-idioma)
│   ├── components/
│   │   ├── Nav.astro                 # Navegación sticky
│   │   ├── Hero.astro                # Sección hero con animación zap
│   │   ├── Projects.astro            # Grid de proyectos
│   │   ├── ProjectCard.astro         # Card de proyecto con tilt
│   │   ├── Process.astro             # Sección de proceso/trabajo
│   │   ├── Testimonials.astro        # Carousel de testimonios (3D)
│   │   ├── Contact.astro             # Formulario de contacto
│   │   ├── SectionHeader.astro       # Componente reutilizable de encabezado de sección
│   │   ├── Footer.astro              # Footer
│   │   ├── Waves.astro               # Efecto de olas SVG
│   │   ├── Cursor.astro              # Cursor personalizado
│   │   └── Logo.astro                # Componente logo
│   ├── scripts/
│   │   ├── main.js                   # Punto de entrada JS
│   │   ├── testimonios-carousel.js   # Lógica del carousel de testimonios
│   │   ├── animations.js             # Animaciones GSAP globales
│   │   ├── card-tilt.js              # Efecto tilt 3D en cards
│   │   ├── cine-text.js              # Animación de texto cinematográfico
│   │   ├── hero-scroll.js            # Scroll-driven hero
│   │   ├── hero-zap.js               # Animación zap del hero
│   │   ├── nav.js                    # Lógica de navegación
│   │   ├── back-to-top.js            # Botón de ir arriba con partículas
│   │   └── waves.js                  # Animación de olas
│   ├── styles/
│   │   └── globals.css               # Estilos globales, CSS custom properties y utilidades
│   └── i18n/
│       ├── es.json                   # Contenido en español
│       ├── en.json                   # Contenido en inglés
│       └── it.json                   # Contenido en italiano
├── public/
│   └── robots.txt
├── astro.config.mjs
├── tailwind.config.mjs
├── tsconfig.json
└── package.json
```

## 🚀 Instalación y Desarrollo

### 1. Instalar dependencias
```bash
npm install
```

### 2. Iniciar servidor de desarrollo
```bash
npm run dev
```
El sitio estará disponible en `http://localhost:4321/`

### 3. Compilar para producción
```bash
npm run build
```

### 4. Preview de producción
```bash
npm run preview
```

## 🎨 Identidad Visual

### Colores
- **Fondo:** `#F2ECE4` (Beige claro)
- **Accent 1:** `#FF5C2B` (Naranja vibrante)
- **Accent 2:** `#FFB088` (Naranja pastel)
- **Accent 3:** `#5B1FFF` (Morado)

### Tipografía
- **Headings:** Outfit (400)
- **Body:** Satoshi (400, 500)

## 🎬 Características

- ✅ Scroll suave con Lenis
- ✅ Animaciones GSAP (scroll-driven, reveal, stagger)
- ✅ Carousel de testimonios con efecto Cover (card nueva cubre a la anterior)
- ✅ Efecto tilt 3D en cards de proyectos
- ✅ Animación cinematográfica de texto
- ✅ Cursor personalizado
- ✅ Efecto de olas SVG
- ✅ Navegación sticky con transiciones
- ✅ Multi-idioma (ES/EN/IT)
- ✅ Dark mode
- ✅ Responsive design con Tailwind
- ✅ Deployado en Vercel con dominio julianrecarte.dev

## 📧 Contacto

Julián Recarte - Desarrollador web FullStack
