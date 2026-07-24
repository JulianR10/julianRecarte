let observer: IntersectionObserver | null = null;

export function initActiveSection(): void {
  const sections = [
    { id: "proyectos", link: document.querySelector<HTMLElement>('.desktop-link[href="#proyectos"]') },
    { id: "proceso", link: document.querySelector<HTMLElement>('.desktop-link[href="#proceso"]') },
    { id: "contacto", link: document.querySelector<HTMLElement>('.desktop-link[href="#contacto"]') },
  ].filter((s): s is { id: string; link: HTMLElement } => s.link !== null);

  if (!sections.length) return;

  observer = new IntersectionObserver(
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
    if (el) observer!.observe(el);
  });
}

export function destroyActiveSection(): void {
  if (observer) {
    observer.disconnect();
    observer = null;
  }
}
