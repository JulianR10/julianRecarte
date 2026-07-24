import { onScroll } from "@scripts/scroll-source";

let autoHideCleanup: (() => void) | null = null;

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

  autoHideCleanup = unsubscribe;
}

export function destroyAutoHide(): void {
  if (autoHideCleanup) {
    autoHideCleanup();
    autoHideCleanup = null;
  }
  const nav = document.getElementById("main-nav");
  if (nav) nav.style.transform = "";
}
