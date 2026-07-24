import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { notifyListeners, scrollToTop as baseScrollToTop } from "@scripts/scroll-source";

let instance: Lenis | null = null;

export function initLenis(): void {
  if (instance) return;

  instance = new Lenis({
    lerp: 0.1,
    orientation: "vertical",
    smoothWheel: true,
    wheelMultiplier: 1,
  });

  instance.on("scroll", (e) => {
    notifyListeners(e.scroll, e.velocity, e.direction);
    ScrollTrigger.update();
  });

  gsap.ticker.add((time: number) => instance!.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
}

export function destroyLenis(): void {
  if (!instance) return;
  instance.destroy();
  instance = null;
}

export function scrollToTop(duration: number = 1.2): void {
  if (instance) instance.scrollTo(0, { duration });
  else baseScrollToTop(duration);
}
