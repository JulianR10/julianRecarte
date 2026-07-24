let resizeCleanup: (() => void) | null = null;

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
  resizeCleanup = () => window.removeEventListener("resize", handler);
}

export function destroyNavbarHeight(): void {
  if (resizeCleanup) {
    resizeCleanup();
    resizeCleanup = null;
  }
  document.documentElement.style.removeProperty("--navbar-h");
}
