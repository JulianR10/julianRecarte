const activeSectionCleanups: (() => void)[] = [];

export function initActiveSection(): void {
  const sections = [
    { id: "proyectos", link: document.querySelector<HTMLElement>('.desktop-link[href="#proyectos"]') },
    { id: "proceso", link: document.querySelector<HTMLElement>('.desktop-link[href="#proceso"]') },
    { id: "contacto", link: document.querySelector<HTMLElement>('.desktop-link[href="#contacto"]') },
  ].filter((s): s is { id: string; link: HTMLElement } => s.link !== null);

  if (!sections.length) return;

  const observer = new IntersectionObserver(
    (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          sections.forEach((s) => s.link.classList.remove("active"));
          const match = sections.find((s) => s.id === entry.target.id);
          if (match) match.link.classList.add("active");
        }
      });
    },
    { rootMargin: "-50% 0px -50% 0px" }
  );

  sections.forEach((s) => {
    const el = document.getElementById(s.id);
    if (el) observer.observe(el);
  });

  activeSectionCleanups.push(() => observer.disconnect());
}

export function destroyActiveSection(): void {
  for (let i = activeSectionCleanups.length - 1; i >= 0; i--) {
    try { activeSectionCleanups[i](); } catch (e) {
      console.warn("[active-section] cleanup error:", e);
    }
  }
  activeSectionCleanups.length = 0;
}
