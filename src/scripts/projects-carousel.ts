let cleanup: (() => void) | null = null;

function updateDots(active: number): void {
  document.querySelectorAll<HTMLElement>(".project-dot").forEach((dot, i) => {
    if (i === active) {
      dot.classList.remove("bg-copy/20", "dark:bg-dark-muted/20");
      dot.classList.add("bg-accent-orange", "scale-125");
    } else {
      dot.classList.add("bg-copy/20", "dark:bg-dark-muted/20");
      dot.classList.remove("bg-accent-orange", "scale-125");
    }
  });
}

export function initProjects(): void {
  if (window.matchMedia("(min-width: 768px)").matches) return;

  const track = document.getElementById("projects-track")!;
  const dots = Array.from(document.querySelectorAll<HTMLElement>(".project-dot"));
  if (!track || !dots.length) return;

  const card = track.querySelector<HTMLElement>("[data-project-card]");
  const step = card ? card.offsetWidth + 16 : track.offsetWidth;
  const total = dots.length;

  let lastIndex = 0;
  let scrollRaf = 0;

  function currentIndex(): number {
    return Math.round(track.scrollLeft / step);
  }

  function onScroll(): void {
    cancelAnimationFrame(scrollRaf);
    scrollRaf = requestAnimationFrame(() => {
      const idx = Math.min(total - 1, Math.max(0, currentIndex()));
      if (idx !== lastIndex) {
        lastIndex = idx;
        updateDots(idx);
      }
    });
  }

  const dotHandlers: (() => void)[] = [];
  dots.forEach((dot) => {
    const handler = () => {
      const idx = parseInt(dot.dataset.index || "0", 10);
      track.scrollTo({ left: idx * step, behavior: "smooth" });
    };
    dot.addEventListener("click", handler);
    dotHandlers.push(handler);
  });

  track.addEventListener("scroll", onScroll, { passive: true });
  updateDots(lastIndex);

  cleanup = () => {
    track.removeEventListener("scroll", onScroll);
    dotHandlers.forEach((h, i) => dots[i]?.removeEventListener("click", h));
    cancelAnimationFrame(scrollRaf);
  };
}

export function destroyProjects(): void {
  if (cleanup) {
    cleanup();
    cleanup = null;
  }
}