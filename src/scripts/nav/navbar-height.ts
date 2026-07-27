const navbarHeightCleanups: (() => void)[] = [];

function setNavbarHeight(): void {
  const nav = document.getElementById("main-nav");
  if (!nav) return;
  const h = nav.offsetHeight;
  document.documentElement.style.setProperty("--navbar-h", h + "px");
}

export function initNavbarHeight(): void {
  setNavbarHeight();
  const handler = () => setNavbarHeight();
  window.addEventListener("resize", handler);
  navbarHeightCleanups.push(() => window.removeEventListener("resize", handler));
}

export function destroyNavbarHeight(): void {
  for (let i = navbarHeightCleanups.length - 1; i >= 0; i--) {
    try { navbarHeightCleanups[i](); } catch (e) {
      console.warn("[navbar-height] cleanup error:", e);
    }
  }
  navbarHeightCleanups.length = 0;
  document.documentElement.style.removeProperty("--navbar-h");
}
