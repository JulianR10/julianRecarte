const langCleanups: (() => void)[] = [];

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

function setup(opts: DropdownOptions): void {
  const btn = document.getElementById(opts.btnId);
  const dd = document.getElementById(opts.ddId);
  const ch = document.getElementById(opts.chId);
  if (!btn || !dd || !ch) return;

  let open = false;

  function set(v: boolean): void {
    open = v;
    dd.classList.remove(v ? opts.closed : opts.opened);
    dd.classList.add(v ? opts.opened : opts.closed);
    ch.style.transform = v ? "rotate(180deg)" : "rotate(0deg)";
    btn.setAttribute("aria-expanded", v ? "true" : "false");
  }

  const btnHandler = (e: MouseEvent): void => { e.stopPropagation(); set(!open); };
  btn.addEventListener("click", btnHandler);

  const optHandlers: { el: Element; handler: () => void }[] = [];
  document.querySelectorAll(opts.optSel).forEach((el) => {
    const handler = () => { const l = (el as HTMLElement).dataset.lang; if (l) switchLang(l); };
    el.addEventListener("click", handler);
    optHandlers.push({ el, handler });
  });

  const docClickHandler = (e: MouseEvent): void => {
    if (open && opts.wrapSel) {
      const wrap = btn.closest(opts.wrapSel);
      if (wrap && !wrap.contains(e.target as Node)) set(false);
    }
  };
  document.addEventListener("click", docClickHandler);

  const keydownHandler = (e: KeyboardEvent): void => { if (e.key === "Escape" && open) set(false); };
  document.addEventListener("keydown", keydownHandler);

  langCleanups.push(() => {
    btn.removeEventListener("click", btnHandler);
    optHandlers.forEach(({ el, handler }) => el.removeEventListener("click", handler));
    document.removeEventListener("click", docClickHandler);
    document.removeEventListener("keydown", keydownHandler);
  });
}

export function initLangSelector(): void {
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

export function destroyLangSelector(): void {
  for (let i = langCleanups.length - 1; i >= 0; i--) {
    try { langCleanups[i](); } catch (e) {
      console.warn("[lang-selector] cleanup error:", e);
    }
  }
  langCleanups.length = 0;
}
