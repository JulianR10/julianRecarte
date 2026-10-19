import type gsap from "gsap";
import { defineAnimation } from "@scripts/gsap-factory";

function wrapTextNodes(el: HTMLElement): HTMLElement[] {
  const chars: HTMLElement[] = [];
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null, false);
  const textNodes: Text[] = [];
  let node: Text | null;
  while ((node = walker.nextNode() as Text | null)) textNodes.push(node);

  // Cada palabra va en un `.cine-word` que no se parte, y los espacios quedan como
  // texto normal: así el título corta entre palabras (si las letras fueran sueltas,
  // cada una sería un punto de corte y una palabra podría partirse en cualquier letra).
  textNodes.forEach((node) => {
    if (!node.textContent!.trim()) return;
    const fragment = document.createDocumentFragment();
    node.textContent!.split(/(\s+)/).forEach((part) => {
      if (!part) return;
      if (/^\s+$/.test(part)) {
        fragment.appendChild(document.createTextNode(part));
        return;
      }
      const word = document.createElement("span");
      word.className = "cine-word";
      Array.from(part).forEach((char) => {
        const span = document.createElement("span");
        span.className = "cine-char";
        span.textContent = char;
        word.appendChild(span);
        chars.push(span);
      });
      fragment.appendChild(word);
    });
    node.parentNode!.replaceChild(fragment, node);
  });

  return chars;
}

export const cineText = defineAnimation((gsap: typeof gsap) => {
  const headings = document.querySelectorAll<HTMLElement>("[data-reveal-heading]");
  if (!headings.length) return;

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  headings.forEach((heading) => {
    if (heading.classList.contains("cine-text-processed")) return;
    const isHero = !!heading.closest("#hero");
    const chars = wrapTextNodes(heading);
    if (!chars.length) return;

    heading.classList.add("revealed", "cine-text-processed");

    if (!prefersReducedMotion) {
      if (!isHero) {
        gsap.fromTo(
          heading,
          { y: 35 },
          {
            y: 0,
            ease: "none",
            scrollTrigger: {
              trigger: heading,
              start: "top bottom",
              end: "bottom top",
              scrub: 1,
            },
          }
        );
      }

      gsap.fromTo(
        chars,
        { opacity: 0, y: 30, filter: "blur(4px)" },
        {
          opacity: 1,
          y: 0,
          filter: "none",
          duration: 0.8,
          stagger: 0.03,
          ease: "power3.out",
          scrollTrigger: {
            trigger: heading,
            start: "top 85%",
            toggleActions: "play none none none",
          },
        }
      );
    }
  });
}, { checkReducedMotion: false });
