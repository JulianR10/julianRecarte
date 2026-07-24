import gsap from "gsap";
import { defineAnimation } from "@scripts/gsap-factory";

function wrapTextNodes(el: HTMLElement): HTMLElement[] {
  const chars: HTMLElement[] = [];
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null, false);
  const textNodes: Text[] = [];
  let node: Text | null;
  while ((node = walker.nextNode() as Text | null)) textNodes.push(node);

  textNodes.forEach((node) => {
    if (!node.textContent!.trim()) return;
    const fragment = document.createDocumentFragment();
    Array.from(node.textContent!).forEach((char) => {
      const span = document.createElement("span");
      span.className = "cine-char";
      span.textContent = char === " " ? " " : char;
      fragment.appendChild(span);
      chars.push(span);
    });
    node.parentNode!.replaceChild(fragment, node);
  });

  return chars;
}

export const cineText = defineAnimation((_gsap: typeof gsap) => {
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
        _gsap.fromTo(
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

      _gsap.fromTo(
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
