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
];

export function initAll(): void {
  initLenis();
  animations.forEach((a) => a.init(gsap));
  revealObserver.init();
  backToTop.init();
  testimonialsCarousel.init();
  projectsCarousel.init();
  ScrollTrigger.refresh();
}

export function destroyAll(): void {
  destroyLenis();
  animations.forEach((a) => a.destroy());
  revealObserver.destroy();
  backToTop.destroy();
  testimonialsCarousel.destroy();
  projectsCarousel.destroy();
}
