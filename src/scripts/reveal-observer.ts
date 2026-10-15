import { defineComponent } from "@scripts/component";

export const revealObserver = defineComponent("reveal-observer", () => {
  const els = document.querySelectorAll("[data-reveal], [data-reveal-heading], [data-reveal-stagger]");
  if (!els.length) return;

  const items: Element[] = [];
  els.forEach((el) => {
    if (el.hasAttribute("data-reveal-stagger")) {
      items.push(...Array.from(el.children));
    } else {
      items.push(el);
    }
  });

  // Con movimiento reducido no animamos, pero el contenido SIEMPRE debe verse:
  // sin esto, `[data-reveal]` queda en opacity:0 para siempre (globals.css:154).
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    items.forEach((el) => el.classList.add("revealed"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("revealed");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  items.forEach((el) => observer.observe(el));

  return () => observer.disconnect();
});
