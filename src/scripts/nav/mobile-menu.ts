const menuCleanups: (() => void)[] = [];

export function initMobileMenu(): void {
  const btn = document.getElementById("menu-btn");
  const overlay = document.getElementById("nav-overlay");
  if (!btn || !overlay) return;

  let isOpen = false;

  function open(): void {
    isOpen = true;
    overlay.classList.remove("nav-overlay-hidden");
    overlay.classList.add("nav-overlay-visible");
    overlay.removeAttribute("aria-hidden");
    overlay.removeAttribute("inert");
    btn.setAttribute("aria-expanded", "true");
    btn.setAttribute("aria-label", btn.dataset.closeLabel || "Cerrar menu");
    const firstFocusable = overlay.querySelector("a, button");
    if (firstFocusable) (firstFocusable as HTMLElement).focus();
  }

  function close(): void {
    isOpen = false;
    overlay.classList.remove("nav-overlay-visible");
    overlay.classList.add("nav-overlay-hidden");
    overlay.setAttribute("aria-hidden", "true");
    overlay.setAttribute("inert", "");
    btn.setAttribute("aria-expanded", "false");
    btn.setAttribute("aria-label", btn.dataset.openLabel || "Abrir menu");
    btn.focus();
  }

  const btnHandler = (e: MouseEvent): void => {
    e.stopPropagation();
    isOpen ? close() : open();
  };
  btn.addEventListener("click", btnHandler);

  const linkHandlers: { link: Element; handler: (e: Event) => void }[] = [];
  document.querySelectorAll(".nav-link").forEach((link) => {
    const handler = (e: Event) => { e.stopPropagation(); close(); };
    link.addEventListener("click", handler);
    linkHandlers.push({ link, handler });
  });

  const overlayHandler = (e: MouseEvent): void => { if (e.target === overlay) close(); };
  overlay.addEventListener("click", overlayHandler);

  const keydownHandler = (e: KeyboardEvent): void => {
    if (e.key === "Escape") {
      const overlayDD = document.getElementById("overlay-lang-dropdown");
      if (overlayDD?.classList.contains("dropdown-open")) return;
      if (isOpen) close();
    }
    if (e.key === "Tab" && isOpen) {
      const focusable = overlay.querySelectorAll("a[href], button:not([disabled]), [tabindex]:not([tabindex='-1'])");
      if (!focusable.length) return;
      const first = focusable[0] as HTMLElement;
      const last = focusable[focusable.length - 1] as HTMLElement;
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  };
  document.addEventListener("keydown", keydownHandler);

  menuCleanups.push(() => {
    btn.removeEventListener("click", btnHandler);
    linkHandlers.forEach(({ link, handler }) => link.removeEventListener("click", handler));
    overlay.removeEventListener("click", overlayHandler);
    document.removeEventListener("keydown", keydownHandler);
  });
}

export function destroyMobileMenu(): void {
  for (let i = menuCleanups.length - 1; i >= 0; i--) {
    try { menuCleanups[i](); } catch (e) {
      console.warn("[mobile-menu] cleanup error:", e);
    }
  }
  menuCleanups.length = 0;
}
