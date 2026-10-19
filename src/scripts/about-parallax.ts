import type gsap from "gsap";
import { defineAnimation } from "@scripts/gsap-factory";

/**
 * Scroll del hero de /sobre-mi/: el disco baja, se achica y se atenúa (eco de la salida del
 * hero del home, más suave porque acá no es sticky), el arco del rol gira alrededor del disco
 * y el wash deriva en sentido opuesto. `defineAnimation` no arranca con
 * movimiento reducido → el hero queda estático.
 */
export const aboutParallax = defineAnimation((gsap: typeof gsap) => {
  const hero = document.querySelector<HTMLElement>("[data-about-hero]");
  const disc = hero?.querySelector<HTMLElement>("[data-about-portrait]");
  const arc = hero?.querySelector<SVGElement>("[data-about-arc]");
  const wash = hero?.querySelector<HTMLElement>("[data-about-wash]");
  if (!hero || !disc) return;

  const baseConfig = {
    trigger: hero,
    start: "top top",
    end: "bottom top",
    scrub: 1,
  };

  gsap.to(disc, { y: 32, scale: 0.9, opacity: 0.55, ease: "none", scrollTrigger: baseConfig });

  if (arc) {
    gsap.to(arc, { rotation: 24, transformOrigin: "50% 50%", ease: "none", scrollTrigger: baseConfig });
  }

  if (wash) {
    gsap.to(wash, { y: -32, ease: "none", scrollTrigger: baseConfig });
  }
});
