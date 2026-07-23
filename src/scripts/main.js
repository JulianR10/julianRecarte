import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { initLenis, destroyLenis } from "@scripts/lenis";
import { initWaves, destroyWaves } from "@scripts/waves";
import { initHeroZap, destroyHeroZap } from "@scripts/hero-zap";
import { initCardTilt, destroyCardTilt } from "@scripts/card-tilt";
import { initHeroScroll, destroyHeroScroll } from "@scripts/hero-scroll";
import { initAnimations, destroyAnimations } from "@scripts/animations";
import { initCineText, destroyCineText } from "@scripts/cine-text";

gsap.registerPlugin(ScrollTrigger);

export function initAll() {
  initLenis();
  initHeroScroll(gsap, ScrollTrigger);
  initWaves(gsap);
  initHeroZap(gsap);
  initCardTilt(gsap);
  initAnimations(gsap, ScrollTrigger);
  initCineText(gsap, ScrollTrigger);
  ScrollTrigger.refresh();
}

export function destroyAll() {
  destroyLenis();
  destroyHeroScroll();
  destroyWaves();
  destroyHeroZap();
  destroyCardTilt();
  destroyAnimations();
  destroyCineText();
}