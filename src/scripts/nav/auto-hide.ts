import { onScroll } from "@scripts/scroll-source";

const autoHideCleanups: (() => void)[] = [];

export function initAutoHide(): void {
  const nav = document.getElementById("main-nav");
  if (!nav) return;

  let lastScrollY = 0;

  const overlay = document.getElementById("nav-overlay");

  const unsubscribe = onScroll((y: number) => {
    if (overlay?.classList.contains("nav-overlay-visible")) return;

    const delta = y - lastScrollY;
    const scrollingDown = delta > 0;

    if (y <= 20 || !scrollingDown) {
      nav.style.transform = "translateY(0)";
    } else {
      nav.style.transform = "translateY(-100%)";
    }

    lastScrollY = y;
  });

  autoHideCleanups.push(unsubscribe);
}

export function destroyAutoHide(): void {
  for (let i = autoHideCleanups.length - 1; i >= 0; i--) {
    try { autoHideCleanups[i](); } catch (e) {
      console.warn("[auto-hide] cleanup error:", e);
    }
  }
  autoHideCleanups.length = 0;
  const nav = document.getElementById("main-nav");
  if (nav) nav.style.transform = "";
}
