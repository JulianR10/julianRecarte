import type gsap from "gsap";
import { defineAnimation } from "@scripts/gsap-factory";
import { onScroll } from "@scripts/scroll-source";

/**
 * Animaciones de /sobre-mi/:
 * - Retrato: aparece desde la niebla (opacidad + blur) con un zoom-out leve.
 * - Contadores `[data-count-to]`: 0 → N al entrar en viewport.
 * - Banda de stack: acelera y se inclina con la velocidad del scroll.
 *
 * El markup trae los estados finales (sin JS o con movimiento reducido todo
 * se ve); los iniciales los pone este módulo.
 */
export const aboutIntro = defineAnimation((gsap: typeof gsap) => {
  const cleanups: Array<() => void> = [];

  const portrait = document.querySelector<HTMLElement>("[data-about-reveal]");
  if (portrait) {
    const img = portrait.querySelector<HTMLElement>("img");
    const tl = gsap.timeline({ delay: 0.2 });

    // El contenedor solo anima opacidad + blur: su `y` es del parallax
    // (about-parallax.ts). Termina en `filter: "none"`, nunca `blur(0px)`.
    tl.fromTo(
      portrait,
      { opacity: 0, filter: "blur(14px)" },
      { opacity: 1, filter: "none", duration: 1.2, ease: "power3.out", clearProps: "opacity,filter" }
    );

    if (img) {
      tl.fromTo(
        img,
        { scale: 1.08, y: 24 },
        { scale: 1, y: 0, duration: 1.4, ease: "power3.out", clearProps: "transform" },
        0
      );
    }
  }

  document.querySelectorAll<HTMLElement>("[data-count-to]").forEach((el) => {
    const target = Number(el.dataset.countTo);
    if (!Number.isFinite(target)) return;
    const counter = { value: 0 };
    el.textContent = "0";
    gsap.to(counter, {
      value: target,
      duration: 1.4,
      ease: "power2.out",
      onUpdate: () => {
        el.textContent = String(Math.round(counter.value));
      },
      scrollTrigger: { trigger: el, start: "top 90%", once: true },
    });
  });

  const track = document.querySelector<HTMLElement>("[data-about-stack]");
  const marquee = track?.getAnimations()[0];
  if (track && marquee) {
    const rows = track.querySelectorAll<HTMLElement>("ul");
    const setSkew = gsap.quickTo(rows, "skewX", { duration: 0.5, ease: "power3.out" });
    let boost = 0;
    let rate = 1;

    const unsubscribe = onScroll((_scroll, velocity) => {
      boost = Math.min(Math.abs(velocity) * 0.25, 5);
      setSkew(gsap.utils.clamp(-6, 6, -velocity * 0.4));
    });

    const tick = () => {
      boost *= 0.92;
      const next = rate + (1 + boost - rate) * 0.12;
      if (Math.abs(next - rate) > 0.001) {
        rate = next;
        marquee.playbackRate = rate;
      }
    };
    gsap.ticker.add(tick);

    cleanups.push(() => {
      unsubscribe();
      gsap.ticker.remove(tick);
      marquee.playbackRate = 1;
    });
  }

  return () => cleanups.forEach((fn) => fn());
});
