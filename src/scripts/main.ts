import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { initLenis, destroyLenis } from "@scripts/lenis-adapter";
import { waves } from "@scripts/waves";
import { heroZap } from "@scripts/hero-zap";
import { heroRotator } from "@scripts/hero-rotator";
import { cardTilt } from "@scripts/card-tilt";
import { heroScroll } from "@scripts/hero-scroll";
import { progressAnimations } from "@scripts/animations";
import { cineText } from "@scripts/cine-text";
import { magnetic } from "@scripts/magnetic";
import { revealObserver } from "@scripts/reveal-observer";
import { backToTop } from "@scripts/back-to-top";
import { testimonialsCarousel } from "@scripts/testimonials-carousel";
import { projectsCarousel } from "@scripts/projects-carousel";
import { solucionesLines } from "@scripts/soluciones-lines";
import { aboutParallax } from "@scripts/about-parallax";
import { aboutIntro } from "@scripts/about-intro";

gsap.registerPlugin(ScrollTrigger);

const animations = [
  heroScroll,
  waves,
  heroZap,
  heroRotator,
  cardTilt,
  magnetic,
  progressAnimations,
  cineText,
  solucionesLines,
  aboutParallax,
  aboutIntro,
];

// Cede el hilo principal entre paso y paso: así ninguna tarea del init pasa
// los 50 ms y no suma Total Blocking Time (el init corre después del primer
// pintado, dentro de la ventana que mide el TBT, sobre todo en desktop).
const yieldToMain = (): Promise<void> => {
  const s = (globalThis as { scheduler?: { yield?: () => Promise<void> } }).scheduler;
  return s?.yield ? s.yield() : new Promise((r) => setTimeout(r, 0));
};

// Cada init y cada destroy incrementan `run`: un init a medio camino se corta
// si hubo un swap de ViewTransitions en el medio.
let run = 0;

export async function initAll(): Promise<void> {
  const id = ++run;
  const steps: (() => void)[] = [
    initLenis,
    ...animations.map((a) => () => a.init(gsap)),
    () => revealObserver.init(),
    () => backToTop.init(),
    () => testimonialsCarousel.init(),
    () => projectsCarousel.init(),
  ];
  for (const step of steps) {
    if (id !== run) return;
    step();
    await yieldToMain();
  }
  if (id === run) ScrollTrigger.refresh();
}

export function destroyAll(): void {
  run++;
  destroyLenis();
  animations.forEach((a) => a.destroy());
  revealObserver.destroy();
  backToTop.destroy();
  testimonialsCarousel.destroy();
  projectsCarousel.destroy();
}
