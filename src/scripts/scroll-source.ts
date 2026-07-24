type ScrollCallback = (scroll: number, velocity: number, direction: number | null) => void;

const listeners = new Set<ScrollCallback>();

export function onScroll(fn: ScrollCallback): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function notifyListeners(scroll: number, velocity: number, direction: number | null): void {
  listeners.forEach((fn) => {
    try {
      fn(scroll, velocity, direction);
    } catch (e) {
      console.warn("[scroll-source] subscriber error:", e);
    }
  });
}

export function scrollToTop(duration: number = 1.2): void {
  window.scrollTo({ top: 0, behavior: "smooth" });
}

export function clearListeners(): void {
  listeners.clear();
}
