let revealObserver: IntersectionObserver | null = null;

export function initRevealObserver(): void {
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

  revealObserver = new IntersectionObserver(
    (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("revealed");
          revealObserver!.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  items.forEach((el) => revealObserver!.observe(el));
}

export function destroyRevealObserver(): void {
  if (revealObserver) {
    revealObserver.disconnect();
    revealObserver = null;
  }
}
