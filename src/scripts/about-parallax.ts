import type gsap from "gsap";
import { defineAnimation } from "@scripts/gsap-factory";

/**
 * Parallax del hero de /sobre-mi/: retrato y wash derivan a distinta
 * velocidad mientras se scrollea. `defineAnimation` no arranca con
 * movimiento reducido → el hero queda estático.
 */
export const aboutParallax = defineAnimation((gsap: typeof gsap) => {
  const hero = document.querySelector<HTMLElement>("[data-about-hero]");
  const portrait = hero?.querySelector<HTMLElement>("[data-about-portrait]");
  const wash = hero?.querySelector<HTMLElement>("[data-about-wash]");
  if (!hero || !portrait) return;

  const baseConfig = {
    trigger: hero,
    start: "top top",
    end: "bottom top",
    scrub: 1,
  };

  gsap.to(portrait, { y: 32, ease: "none", scrollTrigger: baseConfig });

  if (wash) {
    gsap.to(wash, { y: -32, ease: "none", scrollTrigger: baseConfig });
  }
});
