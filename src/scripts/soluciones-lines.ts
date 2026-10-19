import type gsap from "gsap";
import { defineAnimation } from "@scripts/gsap-factory";

/**
 * Separadores editoriales (scaleX 0→1). Cada `<section>` que contenga
 * `[data-solu-line]` dispara los suyos al entrar en viewport: lo usan
 * Soluciones (home) y "Cómo trabajo" (/sobre-mi/).
 */
export const solucionesLines = defineAnimation((gsap: typeof gsap) => {
  const lines = document.querySelectorAll<HTMLElement>("[data-solu-line]");
  if (!lines.length) return;

  const groups = new Map<HTMLElement, HTMLElement[]>();
  lines.forEach((line) => {
    const section = line.closest<HTMLElement>("section") ?? document.body;
    const group = groups.get(section) ?? [];
    group.push(line);
    groups.set(section, group);
  });

  groups.forEach((group, section) => {
    gsap.set(group, { scaleX: 0 });

    gsap.to(group, {
      scaleX: 1,
      duration: 0.6,
      stagger: 0.08,
      ease: "power2.out",
      scrollTrigger: {
        trigger: section,
        start: "top 85%",
        toggleActions: "play none none none",
      },
    });
  });
});
