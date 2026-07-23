<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Architecture review — julianRecarte</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    .module-box { border: 2px solid #334155; border-radius: 6px; background: #f8fafc; }
    .module-box-deep { border: 2px solid #0f172a; border-radius: 6px; background: #1e293b; color: #e2e8f0; }
  </style>
</head>
<body class="bg-stone-50 text-slate-900 font-sans">
  <main class="max-w-5xl mx-auto px-6 py-12 space-y-12">
    <header>
      <h1 class="text-3xl font-bold tracking-tight">julianRecarte architecture review</h1>
      <p class="text-sm text-slate-500 mt-1">2026-07-15</p>
      <div class="flex flex-wrap gap-3 mt-4 text-xs">
        <span class="inline-block w-4 h-4 align-middle rounded border border-slate-600 bg-white"></span> module
        <span class="inline-block w-4 h-4 align-middle rounded border-2 border-slate-900 bg-slate-800"></span> deep module
      </div>
    </header>

    <section id="candidates" class="space-y-10">

      <!-- Candidate 1 -->
      <article class="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
        <div class="flex items-start justify-between gap-4">
          <div>
            <h2 class="text-xl font-semibold">1. Navbar backdrop-filter anclado al contenedor equivocado</h2>
            <div class="flex flex-wrap gap-2 mt-2">
              <span class="inline-block px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">Strong</span>
              <span class="inline-block px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">CSS layout</span>
            </div>
          </div>
        </div>
        <div class="font-mono text-sm text-slate-600">src/styles/globals.css:51,62 | src/components/Nav.astro:168-182</div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="rounded-lg border border-slate-200 bg-white p-4">
            <div class="text-xs uppercase tracking-wider text-slate-500 mb-2">Before</div>
            <div class="flex flex-col items-center justify-center h-64 space-y-1">
              <div class="border-2 border-slate-300 bg-white rounded px-3 py-1 text-xs font-mono">html</div>
              <div class="text-slate-300 text-xs">|</div>
              <div class="border-2 border-red-400 bg-red-50 rounded px-3 py-1 text-xs font-mono font-bold">body { overflow-x: hidden }</div>
              <div class="text-xs text-red-600 italic">scroll container (re-ancla backdrop)</div>
              <div class="text-slate-300 text-xs">|</div>
              <div class="border-2 border-red-400 bg-red-50 rounded px-3 py-1 text-xs font-mono font-bold">#page-wrap { overflow-x: hidden }</div>
              <div class="text-slate-300 text-xs">|</div>
              <div class="module-box px-3 py-1 text-xs font-mono">#main-nav { position: fixed; backdrop-filter: blur }</div>
              <div class="text-xs text-red-500">blur samplea contenedor beige -> invisible</div>
            </div>
          </div>
          <div class="rounded-lg border border-slate-200 bg-white p-4">
            <div class="text-xs uppercase tracking-wider text-slate-500 mb-2">After</div>
            <div class="flex flex-col items-center justify-center h-64 space-y-1">
              <div class="border-2 border-slate-300 bg-white rounded px-3 py-1 text-xs font-mono">html</div>
              <div class="text-slate-300 text-xs">|</div>
              <div class="border-2 border-emerald-500 bg-emerald-50 rounded px-3 py-1 text-xs font-mono font-bold">body { overflow-x: clip }</div>
              <div class="text-xs text-emerald-700 italic">NO es scroll container</div>
              <div class="text-slate-300 text-xs">|</div>
              <div class="border-2 border-emerald-500 bg-emerald-50 rounded px-3 py-1 text-xs font-mono font-bold">#page-wrap { overflow-x: clip }</div>
              <div class="text-slate-300 text-xs">|</div>
              <div class="module-box-deep px-3 py-1 text-xs font-mono">#main-nav { position: fixed; backdrop-filter: blur }</div>
              <div class="text-xs text-emerald-700">blur samplea el viewport -> visible</div>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div><span class="font-medium text-slate-700">Problem</span><br/>overflow-x: hidden en body y #page-wrap crea scroll containers que re-anclan el contexto de sampleo del backdrop-filter. El blur difumina beige sobre beige.</div>
          <div><span class="font-medium text-slate-700">Solution</span><br/>Cambiar overflow-x: hidden a overflow-x: clip. Clip no crea scroll container. Eliminar border-bottom y border-color de transiciones en Nav.astro.</div>
        </div>
        <div>
          <span class="font-medium text-slate-700 text-sm">Wins</span>
          <ul class="list-disc list-inside text-sm text-slate-600 mt-1">
            <li><span class="font-medium">locality:</span> 2 lineas en globals.css resuelven el bug completo</li>
            <li><span class="font-medium">leverage:</span> elimina causa raiz para cualquier fixed element con backdrop-filter</li>
            <li>Se eliminan 3 declaraciones border-bottom y su transicion asociada</li>
          </ul>
        </div>
      </article>

      <!-- Candidate 2 -->
      <article class="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
        <div class="flex items-start justify-between gap-4">
          <div>
            <h2 class="text-xl font-semibold">2. Ciclo de vida de scripts - 7 destroy* functions nunca llamadas</h2>
            <div class="flex flex-wrap gap-2 mt-2">
              <span class="inline-block px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">Strong</span>
              <span class="inline-block px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">JS ViewTransitions</span>
            </div>
          </div>
        </div>
        <div class="font-mono text-sm text-slate-600">src/scripts/*.js (9 modulos) | src/layouts/Layout.astro | src/components/Cursor.astro</div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="rounded-lg border border-slate-200 bg-white p-4">
            <div class="text-xs uppercase tracking-wider text-slate-500 mb-2">Before</div>
            <div class="flex flex-col items-center justify-center h-48 space-y-2">
              <div class="module-box px-4 py-2 text-xs font-mono">main.js: initHeroScroll, initWaves...</div>
              <div class="text-red-500 text-xl">V</div>
              <div class="border-2 border-red-400 bg-red-50 rounded px-4 py-2 text-xs font-mono">9 modulos crean listeners + GSAP contexts<br/><span class="text-red-600 font-bold">NUNCA se limpian</span></div>
              <div class="text-red-500 text-xs">ViewTransitions re-navega -> se duplican</div>
            </div>
          </div>
          <div class="rounded-lg border border-slate-200 bg-white p-4">
            <div class="text-xs uppercase tracking-wider text-slate-500 mb-2">After</div>
            <div class="flex flex-col items-center justify-center h-48 space-y-2">
              <div class="module-box-deep px-4 py-3 text-xs font-mono">lifecycle manager<br/><span class="text-slate-400 text-[10px]">astro:page-load -> init<br/>astro:before-swap -> destroy</span></div>
              <div class="text-emerald-500 text-xl">V</div>
              <div class="border-2 border-emerald-500 bg-emerald-50 rounded px-4 py-2 text-xs font-mono">cada modulo exporta destroy()<br/><span class="text-emerald-700">se llama en cada navegacion SPA</span></div>
              <div class="text-emerald-700 text-xs">0 leaks. 0 listeners huerfanos.</div>
            </div>
          </div>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div><span class="font-medium text-slate-700">Problem</span><br/>9 modulos exportan destroy* pero ninguna se llama. Con ViewTransitions, las re-navegaciones acumulan listeners duplicados de scroll, keydown, mousemove, y multiples instancias de Lenis + GSAP contexts.</div>
          <div><span class="font-medium text-slate-700">Solution</span><br/>Centralizar en un lifecycle manager que escuche astro:page-load para init y astro:before-swap para destroy.</div>
        </div>
        <div>
          <span class="font-medium text-slate-700 text-sm">Wins</span>
          <ul class="list-disc list-inside text-sm text-slate-600 mt-1">
            <li><span class="font-medium">locality:</span> leaks se previenen desde un solo punto</li>
            <li><span class="font-medium">leverage:</span> un manager central controla 9 modulos</li>
            <li>~40 lineas de dead exports eliminadas (destroy* definidos pero no usados)</li>
          </ul>
        </div>
      </article>

      <!-- Candidate 3 -->
      <article class="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
        <h2 class="text-xl font-semibold">3. LangSelector: dos ramas casi identicas, interface approx implementation</h2>
        <div class="flex flex-wrap gap-2"><span class="inline-block px-3 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">Worth exploring</span></div>
        <div class="font-mono text-sm text-slate-600">src/components/LangSelector.astro (144 lineas, ~90% duplicacion desktop/overlay)</div>
        <div class="text-sm">Problema: dos ramas condicionales comparten ~90% de estructura como copias independientes. CSS de dropdown duplicado (4 clases).<br/>Solucion: un solo template con CSS variables y clases compartidas. Reducir de 144 a ~80 lineas.</div>
      </article>

      <!-- Candidate 4 -->
      <article class="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
        <h2 class="text-xl font-semibold">4. Testimonios carousel: modulo profundo para contenido superficial</h2>
        <div class="flex flex-wrap gap-2"><span class="inline-block px-3 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">Worth exploring</span></div>
        <div class="font-mono text-sm text-slate-600">src/components/Testimonials.astro (124 lineas) | src/scripts/testimonios-carousel.js (163 lineas)</div>
        <div class="text-sm">Problema: carrusel 3D con 163 lineas de JS + GSAP para 3 items.<br/>Solucion: grid estatico con reveal-on-scroll CSS. Cero JS adicional.</div>
      </article>

      <!-- Candidate 5 -->
      <article class="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
        <h2 class="text-xl font-semibold">5. Hero scroll animations: dos modulos compitiendo sobre los mismos elementos</h2>
        <div class="flex flex-wrap gap-2"><span class="inline-block px-3 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">Worth exploring</span></div>
        <div class="font-mono text-sm text-slate-600">src/scripts/hero-scroll.js (59 lineas) | src/scripts/cine-text.js (85 lineas)</div>
        <div class="text-sm">Problema: dos ScrollTrigger timelines independientes sobre el mismo subarbol DOM (#hero).<br/>Solucion: fusionar en un solo timeline coordinado.</div>
      </article>

      <!-- Candidate 6 -->
      <article class="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
        <h2 class="text-xl font-semibold">6. rAF-throttled scroll listener duplicado en 2 modulos</h2>
        <div class="flex flex-wrap gap-2"><span class="inline-block px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600">Speculative</span></div>
        <div class="font-mono text-sm text-slate-600">src/scripts/nav.js (initNavBackground) | src/scripts/back-to-top.js</div>
        <div class="text-sm">Problema: mismo patron rAF-throttle copiado textual en dos modulos. 3 listeners de scroll activos.<br/>Solucion: extraer utility onScroll(callback) con un solo rAF loop.</div>
      </article>

      <!-- Candidate 7 -->
      <article class="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
        <h2 class="text-xl font-semibold">7. Color hardcodeado en Hero.highlight-word</h2>
        <div class="flex flex-wrap gap-2"><span class="inline-block px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600">Speculative</span></div>
        <div class="font-mono text-sm text-slate-600">src/components/Hero.astro:124</div>
        <div class="text-sm">Problema: background-color: rgba(255, 92, 43, 0.13) hardcodea el naranja.<br/>Solucion: usar rgba(var(--rgb-accent-orange), 0.13). Variable ya existe en globals.css:18.</div>
      </article>

    </section>

    <section class="bg-slate-900 text-white rounded-xl p-8 space-y-4">
      <h2 class="text-2xl font-bold">Top recommendation</h2>
      <p class="text-slate-300"><span class="font-semibold text-white">#1 Navbar backdrop-filter + border-bottom.</span> Es la peticion directa del usuario y tiene el mayor ratio impacto/esfuerzo: 2 lineas en globals.css reparan un bug visual que afecta la navegacion principal, mas la limpieza de border-bottom. Despues, abordar el lifecycle de scripts (#2) evitaria leaks de memoria en navegacion SPA.</p>
    </section>

  </main>
</body>
</html>