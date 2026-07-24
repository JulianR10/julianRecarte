import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { initLenis, destroyLenis } from "@scripts/lenis-adapter";
import { waves } from "@scripts/waves";
import { heroZap } from "@scripts/hero-zap";
import { cardTilt } from "@scripts/card-tilt";
import { heroScroll } from "@scripts/hero-scroll";
import { progressAnimations } from "@scripts/animations";
import { cineText } from "@scripts/cine-text";
import { magnetic } from "@scripts/magnetic";
import { initRevealObserver, destroyRevealObserver } from "@scripts/reveal-observer";
import { initBackToTop, destroyBackToTop } from "@scripts/back-to-top";
import { initTestimonials, destroyTestimonials } from "@scripts/testimonials-carousel";

gsap.registerPlugin(ScrollTrigger);

const animations = [
  heroScroll,
  waves,
  heroZap,
  cardTilt,
  magnetic,
  progressAnimations,
  cineText,
];

export function initAll(): void {
  initLenis();
  animations.forEach((a) => a.init(gsap, ScrollTrigger));
  initRevealObserver();
  initBackToTop();
  initTestimonials();
  ScrollTrigger.refresh();
}

export function destroyAll(): void {
  destroyLenis();
  animations.forEach((a) => a.destroy());
  destroyRevealObserver();
  destroyBackToTop();
  destroyTestimonials();
}
