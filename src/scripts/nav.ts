import { defineComponent } from "@scripts/component";
import { onScroll } from "@scripts/scroll-source";

export const nav = defineComponent("nav", (scope) => {
  void scope;
  const cleanups: (() => void)[] = [];

  const navEl = document.getElementById("main-nav");
  const overlay = document.getElementById("nav-overlay");

  // --- navbar height -------------------------------------------------------
  function setNavbarHeight(): void {
    if (!navEl) return;
    const h = navEl.offsetHeight;
    document.documentElement.style.setProperty("--navbar-h", h + "px");
  }
  setNavbarHeight();
  const onResize = () => setNavbarHeight();
  window.addEventListener("resize", onResize);
  cleanups.push(() => window.removeEventListener("resize", onResize));

  // --- theme ---------------------------------------------------------------
  const lightBtn = document.getElementById("light-toggle");
  const darkBtn = document.getElementById("dark-toggle");
  const indicator = document.getElementById("theme-indicator");
  const overlayLight = document.getElementById("overlay-light-toggle");
  const overlayDark = document.getElementById("overlay-dark-toggle");

  function setTheme(dark: boolean): void {
    if (dark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("dark-mode", "true");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("dark-mode", "false");
    }
    if (indicator) {
      const target = dark ? darkBtn : lightBtn;
      if (target) indicator.style.left = target.offsetLeft + "px";
    }
    if (lightBtn && darkBtn) {
      lightBtn.classList.toggle("text-white", !dark);
      lightBtn.classList.toggle("text-dark-muted/60", dark);
      darkBtn.classList.toggle("text-white", dark);
      darkBtn.classList.toggle("text-dark-muted/60", !dark);
    }
  }

  const lightHandler = () => setTheme(false);
  const darkHandler = () => setTheme(true);

  if (lightBtn && darkBtn && indicator) {
    setTheme(localStorage.getItem("dark-mode") === "true");
    lightBtn.addEventListener("click", lightHandler);
    darkBtn.addEventListener("click", darkHandler);
    cleanups.push(() => {
      lightBtn.removeEventListener("click", lightHandler);
      darkBtn.removeEventListener("click", darkHandler);
    });
  }

  if (overlayLight && overlayDark) {
    overlayLight.addEventListener("click", lightHandler);
    overlayDark.addEventListener("click", darkHandler);
    cleanups.push(() => {
      overlayLight.removeEventListener("click", lightHandler);
      overlayDark.removeEventListener("click", darkHandler);
    });
  }

  // --- active section ------------------------------------------------------
  const sections = [
    { id: "soluciones", link: document.querySelector<HTMLElement>('.desktop-link[href="#soluciones"]') },
    { id: "proyectos", link: document.querySelector<HTMLElement>('.desktop-link[href="#proyectos"]') },
    { id: "proceso", link: document.querySelector<HTMLElement>('.desktop-link[href="#proceso"]') },
    { id: "contacto", link: document.querySelector<HTMLElement>('.desktop-link[href="#contacto"]') },
  ].filter((s): s is { id: string; link: HTMLElement } => s.link !== null);

  if (sections.length) {
    const observer = new IntersectionObserver(
      (entries: IntersectionObserverEntry[]) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            sections.forEach((s) => {
              s.link.classList.remove("active");
              s.link.removeAttribute("aria-current");
            });
            const match = sections.find((s) => s.id === entry.target.id);
            if (match) {
              match.link.classList.add("active");
              match.link.setAttribute("aria-current", "page");
            }
          }
        });
      },
      { rootMargin: "-50% 0px -50% 0px" }
    );

    sections.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });

    cleanups.push(() => observer.disconnect());
  }

  // --- mobile menu ---------------------------------------------------------
  const btn = document.getElementById("menu-btn");
  if (btn && overlay) {
    let isOpen = false;

    function open(): void {
      isOpen = true;
      overlay!.classList.remove("nav-overlay-hidden");
      overlay!.classList.add("nav-overlay-visible");
      overlay!.removeAttribute("aria-hidden");
      overlay!.removeAttribute("inert");
      btn.setAttribute("aria-expanded", "true");
      btn.setAttribute("aria-label", btn.dataset.closeLabel || "Cerrar menu");
      const firstFocusable = overlay!.querySelector("a, button");
      if (firstFocusable) (firstFocusable as HTMLElement).focus();
    }

    function close(): void {
      isOpen = false;
      overlay!.classList.remove("nav-overlay-visible");
      overlay!.classList.add("nav-overlay-hidden");
      overlay!.setAttribute("aria-hidden", "true");
      overlay!.setAttribute("inert", "");
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
        const focusable = overlay!.querySelectorAll("a[href], button:not([disabled]), [tabindex]:not([tabindex='-1'])");
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

    cleanups.push(() => {
      btn.removeEventListener("click", btnHandler);
      linkHandlers.forEach(({ link, handler }) => link.removeEventListener("click", handler));
      overlay.removeEventListener("click", overlayHandler);
      document.removeEventListener("keydown", keydownHandler);
    });
  }

  // --- language selector ---------------------------------------------------
  function switchLang(newLang: string): void {
    const path = window.location.pathname;
    const parts = path.split("/");
    const idx = parts.findIndex((p) => /^(es|en|it)$/.test(p));
    if (idx !== -1) {
      parts[idx] = newLang;
      window.scrollTo(0, 0);
      window.location.pathname = parts.join("/");
    }
  }

  interface DropdownOptions {
    btnId: string;
    ddId: string;
    chId: string;
    optSel: string;
    wrapSel: string;
    opened: string;
    closed: string;
  }

  function setupDropdown(opts: DropdownOptions): void {
    const ddBtn = document.getElementById(opts.btnId);
    const dd = document.getElementById(opts.ddId);
    const ch = document.getElementById(opts.chId);
    if (!ddBtn || !dd || !ch) return;

    let open = false;

    function set(v: boolean): void {
      open = v;
      dd.classList.remove(v ? opts.closed : opts.opened);
      dd.classList.add(v ? opts.opened : opts.closed);
      ch.style.transform = v ? "rotate(180deg)" : "rotate(0deg)";
      ddBtn.setAttribute("aria-expanded", v ? "true" : "false");
    }

    const btnHandler = (e: MouseEvent): void => { e.stopPropagation(); set(!open); };
    ddBtn.addEventListener("click", btnHandler);

    const optHandlers: { el: Element; handler: () => void }[] = [];
    document.querySelectorAll(opts.optSel).forEach((el) => {
      const handler = () => { const l = (el as HTMLElement).dataset.lang; if (l) switchLang(l); };
      el.addEventListener("click", handler);
      optHandlers.push({ el, handler });
    });

    const docClickHandler = (e: MouseEvent): void => {
      if (open && opts.wrapSel) {
        const wrap = ddBtn.closest(opts.wrapSel);
        if (wrap && !wrap.contains(e.target as Node)) set(false);
      }
    };
    document.addEventListener("click", docClickHandler);

    const keydownHandler = (e: KeyboardEvent): void => { if (e.key === "Escape" && open) set(false); };
    document.addEventListener("keydown", keydownHandler);

    cleanups.push(() => {
      ddBtn.removeEventListener("click", btnHandler);
      optHandlers.forEach(({ el, handler }) => el.removeEventListener("click", handler));
      document.removeEventListener("click", docClickHandler);
      document.removeEventListener("keydown", keydownHandler);
    });
  }

  setupDropdown({
    btnId: "lang-btn",
    ddId: "lang-dropdown",
    chId: "lang-chevron",
    optSel: ".lang-option",
    wrapSel: ".lang-selector",
    opened: "dropdown-open",
    closed: "dropdown-closed",
  });

  setupDropdown({
    btnId: "overlay-lang-btn",
    ddId: "overlay-lang-dropdown",
    chId: "overlay-lang-chevron",
    optSel: ".lang-option",
    wrapSel: ".lang-selector",
    opened: "dropdown-open",
    closed: "dropdown-closed",
  });

  // --- auto hide -----------------------------------------------------------
  if (navEl) {
    let lastScrollY = 0;

    const unsubscribe = onScroll((y: number) => {
      if (overlay?.classList.contains("nav-overlay-visible")) return;

      const delta = y - lastScrollY;
      const scrollingDown = delta > 0;

      if (y <= 20 || !scrollingDown) {
        navEl!.style.transform = "translateY(0)";
      } else {
        navEl!.style.transform = "translateY(-100%)";
      }

      lastScrollY = y;
    });

    cleanups.push(unsubscribe);
  }

  // --- teardown ------------------------------------------------------------
  return () => {
    for (let i = cleanups.length - 1; i >= 0; i--) {
      try {
        cleanups[i]();
      } catch (e) {
        console.warn("[nav] cleanup error:", e);
      }
    }
    document.documentElement.style.removeProperty("--navbar-h");
    if (navEl) navEl.style.transform = "";
  };
});

export function initNav(): void {
  nav.init();
}

export function destroyNav(): void {
  nav.destroy();
}
