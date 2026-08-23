import type gsap from "gsap";
import { defineAnimation } from "@scripts/gsap-factory";

export const solucionesLines = defineAnimation((gsap: typeof gsap) => {
  const lines = document.querySelectorAll<HTMLElement>("[data-solu-line]");
  if (!lines.length) return;

  gsap.set(lines, { scaleX: 0 });

  gsap.to(lines, {
    scaleX: 1,
    duration: 0.6,
    stagger: 0.08,
    ease: "power2.out",
    scrollTrigger: {
      trigger: "#soluciones",
      start: "top 85%",
      toggleActions: "play none none none",
    },
  });
});
