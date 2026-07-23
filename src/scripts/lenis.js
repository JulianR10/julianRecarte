import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

let instance = null;
const listeners = new Set();

export function initLenis() {
  if (instance) return;

  instance = new Lenis({
    lerp: 0.1,
    orientation: "vertical",
    smoothWheel: true,
    wheelMultiplier: 1,
  });

  instance.on("scroll", (e) => {
    listeners.forEach((fn) => {
      try { fn(e.scroll, e.velocity, e.direction); } catch (_) {}
    });
    ScrollTrigger.update();
  });

  gsap.ticker.add((time) => instance.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
}

export function destroyLenis() {
  if (!instance) return;
  instance.destroy();
  instance = null;
  listeners.clear();
}

export function onScroll(fn) {
  listeners.add(fn);
  if (instance) fn(instance.scroll, instance.velocity, instance.direction);
  return () => listeners.delete(fn);
}

export function scrollToTop(duration = 1.2) {
  if (instance) instance.scrollTo(0, { duration });
  else window.scrollTo({ top: 0, behavior: "smooth" });
}