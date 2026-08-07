import { defineComponent } from "@scripts/component";

export const revealObserver = defineComponent("reveal-observer", () => {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

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
