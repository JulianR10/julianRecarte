import { onScroll } from "@scripts/scroll-source";

const autoHideCleanups: (() => void)[] = [];

export function initAutoHide(): void {
  const nav = document.getElementById("main-nav");
  if (!nav) return;

  let lastScrollY = 0;

  const unsubscribe = onScroll((y: number) => {
    const delta = y - lastScrollY;
    const scrollingDown = delta > 0;
    const pastThreshold = y > 150;

    if (scrollingDown && pastThreshold) {
      nav.style.transform = "translateY(-100%)";
    } else if (y <= 0) {
      nav.style.transform = "translateY(0)";
    } else if (!scrollingDown) {
      nav.style.transform = "translateY(0)";
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
