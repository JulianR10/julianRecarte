import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { notifyListeners } from "@scripts/scroll-source";

let instance: Lenis | null = null;
let tickerCleanup: (() => void) | null = null;
let nativeScrollCleanup: (() => void) | null = null;

/** Movimiento reducido — consultado en cada init (initAll corre de nuevo tras cada navegación). */
function prefersReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function onNativeScroll(): void {
  notifyListeners(window.scrollY, 0, null);
  ScrollTrigger.update();
}

export function initLenis(): void {
  if (instance) return;

  // Movimiento reducido: sin scroll suave. Lenis se saltea por completo y los
  // suscriptores de onScroll se alimentan del scroll nativo, así el botón
  // "volver arriba" y el resaltado de sección del nav siguen funcionando.
  if (prefersReducedMotion()) {
    nativeScrollCleanup = () => window.removeEventListener("scroll", onNativeScroll);
    window.addEventListener("scroll", onNativeScroll, { passive: true });
    onNativeScroll();
    return;
  }

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

  const tickerFn = (time: number) => instance!.raf(time * 1000);
  gsap.ticker.add(tickerFn);
  gsap.ticker.lagSmoothing(0);
  tickerCleanup = () => gsap.ticker.remove(tickerFn);
}

export function destroyLenis(): void {
  if (nativeScrollCleanup) {
    nativeScrollCleanup();
    nativeScrollCleanup = null;
  }
  if (!instance) return;
  if (tickerCleanup) {
    tickerCleanup();
    tickerCleanup = null;
  }
  instance.destroy();
  instance = null;
}

export function scrollToTop(duration: number = 1.2): void {
  if (instance) instance.scrollTo(0, { duration });
  else window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? "auto" : "smooth" });
}
