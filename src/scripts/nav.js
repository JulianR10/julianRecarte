import { onScroll } from "@scripts/lenis";

const cleanups = [];

/* ── Active section ── */

let observer = null;

function initActiveSection() {
  const sections = [
    { id: "proyectos", link: document.querySelector('.desktop-link[href="#proyectos"]') },
    { id: "proceso", link: document.querySelector('.desktop-link[href="#proceso"]') },
    { id: "contacto", link: document.querySelector('.desktop-link[href="#contacto"]') },
  ].filter((s) => s.link);

  if (!sections.length) return;

  observer = new IntersectionObserver(
    (entries) => {
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
    if (el) observer.observe(el);
  });
}

function destroyActiveSection() {
  if (observer) {
    observer.disconnect();
    observer = null;
  }
}

/* ── Theme ── */

const themeCleanups = [];

function setTheme(dark, lightBtn, darkBtn, indicator) {
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
    lightBtn.classList.toggle("text-background", dark);
    darkBtn.classList.toggle("text-white", dark);
    darkBtn.classList.toggle("text-dark-muted/60", !dark);
  }
}

function initTheme() {
  const lightBtn = document.getElementById("light-toggle");
  const darkBtn = document.getElementById("dark-toggle");
  const indicator = document.getElementById("theme-indicator");
  const overlayLight = document.getElementById("overlay-light-toggle");
  const overlayDark = document.getElementById("overlay-dark-toggle");

  const lightHandler = () => setTheme(false, lightBtn, darkBtn, indicator);
  const darkHandler = () => setTheme(true, lightBtn, darkBtn, indicator);

  if (lightBtn && darkBtn && indicator) {
    setTheme(document.documentElement.classList.contains("dark"), lightBtn, darkBtn, indicator);
    lightBtn.addEventListener("click", lightHandler);
    darkBtn.addEventListener("click", darkHandler);
    themeCleanups.push(() => {
      lightBtn.removeEventListener("click", lightHandler);
      darkBtn.removeEventListener("click", darkHandler);
    });
  }

  if (overlayLight && overlayDark) {
    overlayLight.addEventListener("click", lightHandler);
    overlayDark.addEventListener("click", darkHandler);
    themeCleanups.push(() => {
      overlayLight.removeEventListener("click", lightHandler);
      overlayDark.removeEventListener("click", darkHandler);
    });
  }
}

function destroyTheme() {
  for (let i = themeCleanups.length - 1; i >= 0; i--) {
    try { themeCleanups[i](); } catch (e) { /* ignore */ }
  }
  themeCleanups.length = 0;
}

/* ── Mobile menu ── */

const menuCleanups = [];

function initMobileMenu() {
  const btn = document.getElementById("menu-btn");
  const overlay = document.getElementById("nav-overlay");
  if (!btn || !overlay) return;

  let isOpen = false;

  function open() {
    isOpen = true;
    overlay.classList.remove("nav-overlay-hidden");
    overlay.classList.add("nav-overlay-visible");
    overlay.removeAttribute("aria-hidden");
    overlay.removeAttribute("inert");
    btn.setAttribute("aria-expanded", "true");
    btn.setAttribute("aria-label", btn.dataset.closeLabel || "Cerrar menu");
    const firstFocusable = overlay.querySelector("a, button");
    if (firstFocusable) firstFocusable.focus();
  }

  function close() {
    isOpen = false;
    overlay.classList.remove("nav-overlay-visible");
    overlay.classList.add("nav-overlay-hidden");
    overlay.setAttribute("aria-hidden", "true");
    overlay.setAttribute("inert", "");
    btn.setAttribute("aria-expanded", "false");
    btn.setAttribute("aria-label", btn.dataset.openLabel || "Abrir menu");
    btn.focus();
  }

  const btnHandler = (e) => {
    e.stopPropagation();
    isOpen ? close() : open();
  };
  btn.addEventListener("click", btnHandler);

  const linkHandlers = [];
  document.querySelectorAll(".nav-link").forEach((link) => {
    const handler = (e) => { e.stopPropagation(); close(); };
    link.addEventListener("click", handler);
    linkHandlers.push({ link, handler });
  });

  const overlayHandler = (e) => { if (e.target === overlay) close(); };
  overlay.addEventListener("click", overlayHandler);

  const keydownHandler = (e) => {
    if (e.key === "Escape") {
      const overlayDD = document.getElementById("overlay-lang-dropdown");
      if (overlayDD?.classList.contains("dropdown-open")) return;
      if (isOpen) close();
    }
    if (e.key === "Tab" && isOpen) {
      const focusable = overlay.querySelectorAll("a[href], button:not([disabled]), [tabindex]:not([tabindex='-1'])");
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
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

function destroyMobileMenu() {
  for (let i = menuCleanups.length - 1; i >= 0; i--) {
    try { menuCleanups[i](); } catch (e) { /* ignore */ }
  }
  menuCleanups.length = 0;
}

/* ── Language selector ── */

const langCleanups = [];

function switchLang(newLang) {
  const path = window.location.pathname;
  const parts = path.split("/");
  const idx = parts.findIndex((p) => /^(es|en|it)$/.test(p));
  if (idx !== -1) {
    parts[idx] = newLang;
    window.scrollTo(0, 0);
    window.location.pathname = parts.join("/");
  }
}

function initLangSelector() {
  function setup(opts) {
    const btn = document.getElementById(opts.btnId);
    const dd = document.getElementById(opts.ddId);
    const ch = document.getElementById(opts.chId);
    if (!btn || !dd || !ch) return;

    let open = false;

    function set(v) {
      open = v;
      dd.classList.remove(v ? opts.closed : opts.opened);
      dd.classList.add(v ? opts.opened : opts.closed);
      ch.style.transform = v ? "rotate(180deg)" : "rotate(0deg)";
      btn.setAttribute("aria-expanded", v ? "true" : "false");
    }

    const btnHandler = (e) => { e.stopPropagation(); set(!open); };
    btn.addEventListener("click", btnHandler);

    const optHandlers = [];
    document.querySelectorAll(opts.optSel).forEach((el) => {
      const handler = () => { const l = el.dataset.lang; if (l) switchLang(l); };
      el.addEventListener("click", handler);
      optHandlers.push({ el, handler });
    });

    const docClickHandler = (e) => {
      if (open && opts.wrapSel) {
        const wrap = btn.closest(opts.wrapSel);
        if (wrap && !wrap.contains(e.target)) set(false);
      }
    };
    document.addEventListener("click", docClickHandler);

    const keydownHandler = (e) => { if (e.key === "Escape" && open) set(false); };
    document.addEventListener("keydown", keydownHandler);

    langCleanups.push(() => {
      btn.removeEventListener("click", btnHandler);
      optHandlers.forEach(({ el, handler }) => el.removeEventListener("click", handler));
      document.removeEventListener("click", docClickHandler);
      document.removeEventListener("keydown", keydownHandler);
    });
  }

  setup({
    btnId: "lang-btn",
    ddId: "lang-dropdown",
    chId: "lang-chevron",
    optSel: ".lang-option",
    wrapSel: ".lang-selector",
    opened: "dropdown-open",
    closed: "dropdown-closed",
  });

  setup({
    btnId: "overlay-lang-btn",
    ddId: "overlay-lang-dropdown",
    chId: "overlay-lang-chevron",
    optSel: ".lang-option",
    wrapSel: ".lang-selector",
    opened: "dropdown-open",
    closed: "dropdown-closed",
  });
}

function destroyLangSelector() {
  for (let i = langCleanups.length - 1; i >= 0; i--) {
    try { langCleanups[i](); } catch (e) { /* ignore */ }
  }
  langCleanups.length = 0;
}

/* ── Auto-hide on scroll ── */

let autoHideCleanup = null;

function initAutoHide() {
  const nav = document.getElementById("main-nav");
  if (!nav) return;

  let lastScrollY = 0;

  const unsubscribe = onScroll((y) => {
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

function destroyAutoHide() {
  if (autoHideCleanup) {
    autoHideCleanup();
    autoHideCleanup = null;
  }
  const nav = document.getElementById("main-nav");
  if (nav) nav.style.transform = "";
}

/* ── Public API ── */

export function initNav() {
  initActiveSection();
  initTheme();
  initMobileMenu();
  initLangSelector();
  initAutoHide();
}

export function destroyNav() {
  destroyActiveSection();
  destroyTheme();
  destroyMobileMenu();
  destroyLangSelector();
  destroyAutoHide();
}
