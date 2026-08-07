import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { initNav, destroyNav } from "@scripts/nav";
import { notifyListeners } from "@scripts/scroll-source";

class FakeIO {
  static instances: FakeIO[] = [];
  callback: IntersectionObserverCallback;
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();

  constructor(cb: IntersectionObserverCallback) {
    this.callback = cb;
    FakeIO.instances.push(this);
  }

  trigger(target: Element, isIntersecting = true): void {
    this.callback([{ target, isIntersecting } as IntersectionObserverEntry], this as unknown as IntersectionObserver);
  }
}

function setupDom(): void {
  document.body.innerHTML = `
    <nav id="main-nav">
      <a class="desktop-link" href="#proyectos">Proyectos</a>
      <a class="desktop-link" href="#proceso">Proceso</a>
      <a class="desktop-link" href="#contacto">Contacto</a>
      <div id="theme-toggle">
        <div id="theme-indicator"></div>
        <button id="light-toggle">light</button>
        <button id="dark-toggle">dark</button>
      </div>
      <div class="lang-selector">
        <button id="lang-btn">es</button>
        <div id="lang-dropdown">
          <button class="lang-option" data-lang="es">ES</button>
          <button class="lang-option" data-lang="en">EN</button>
        </div>
        <span id="lang-chevron"></span>
      </div>
      <button id="menu-btn" data-close-label="Cerrar" data-open-label="Abrir">menu</button>
    </nav>
    <div id="nav-overlay">
      <a class="nav-link" href="#proyectos">Proyectos</a>
      <div class="lang-selector">
        <button id="overlay-lang-btn">es</button>
        <div id="overlay-lang-dropdown">
          <button class="lang-option" data-lang="it">IT</button>
        </div>
        <span id="overlay-lang-chevron"></span>
      </div>
      <button id="overlay-light-toggle">light</button>
      <button id="overlay-dark-toggle">dark</button>
    </div>
    <section id="proyectos"></section>
    <section id="proceso"></section>
    <section id="contacto"></section>
  `;
}

describe("nav", () => {
  beforeEach(() => {
    destroyNav();
    FakeIO.instances.length = 0;
    localStorage.clear();
    document.body.innerHTML = "";
    vi.stubGlobal("IntersectionObserver", FakeIO);
    setupDom();
    initNav();
  });

  afterEach(() => {
    destroyNav();
    vi.unstubAllGlobals();
  });

  it("toggles dark mode and persists to localStorage", () => {
    const html = document.documentElement;
    const darkBtn = document.getElementById("dark-toggle")!;
    const lightBtn = document.getElementById("light-toggle")!;

    expect(html.classList.contains("dark")).toBe(false);

    darkBtn.click();
    expect(html.classList.contains("dark")).toBe(true);
    expect(localStorage.getItem("dark-mode")).toBe("true");
    expect(darkBtn.classList.contains("text-white")).toBe(true);

    lightBtn.click();
    expect(html.classList.contains("dark")).toBe(false);
    expect(localStorage.getItem("dark-mode")).toBe("false");
  });

  it("sets and clears the navbar height CSS variable", () => {
    const root = document.documentElement;
    expect(root.style.getPropertyValue("--navbar-h")).toBe("0px");
    destroyNav();
    expect(root.style.getPropertyValue("--navbar-h")).toBe("");
  });

  it("marks the active section on the desktop link", () => {
    const io = FakeIO.instances[FakeIO.instances.length - 1];
    const proyectos = document.getElementById("proyectos")!;
    const link = document.querySelector<HTMLElement>('.desktop-link[href="#proyectos"]')!;

    io.trigger(proyectos);
    expect(link.classList.contains("active")).toBe(true);
    expect(link.getAttribute("aria-current")).toBe("page");

    const proceso = document.getElementById("proceso")!;
    const procesoLink = document.querySelector<HTMLElement>('.desktop-link[href="#proceso"]')!;
    io.trigger(proceso);
    expect(link.classList.contains("active")).toBe(false);
    expect(procesoLink.classList.contains("active")).toBe(true);
  });

  it("opens and closes the mobile menu", () => {
    const btn = document.getElementById("menu-btn")!;
    const overlay = document.getElementById("nav-overlay")!;

    expect(overlay.classList.contains("nav-overlay-visible")).toBe(false);
    btn.click();
    expect(overlay.classList.contains("nav-overlay-visible")).toBe(true);
    expect(btn.getAttribute("aria-expanded")).toBe("true");
    expect(overlay.hasAttribute("inert")).toBe(false);

    btn.click();
    expect(overlay.classList.contains("nav-overlay-hidden")).toBe(true);
    expect(btn.getAttribute("aria-expanded")).toBe("false");
    expect(overlay.hasAttribute("inert")).toBe(true);
  });

  it("closes the mobile menu with Escape", () => {
    const btn = document.getElementById("menu-btn")!;
    const overlay = document.getElementById("nav-overlay")!;
    btn.click();
    expect(overlay.classList.contains("nav-overlay-visible")).toBe(true);

    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    expect(overlay.classList.contains("nav-overlay-hidden")).toBe(true);
  });

  it("toggles the language dropdown classes", () => {
    const btn = document.getElementById("lang-btn")!;
    const dd = document.getElementById("lang-dropdown")!;

    btn.click();
    expect(dd.classList.contains("dropdown-open")).toBe(true);
    expect(btn.getAttribute("aria-expanded")).toBe("true");

    btn.click();
    expect(dd.classList.contains("dropdown-closed")).toBe(true);
    expect(btn.getAttribute("aria-expanded")).toBe("false");
  });

  it("auto-hides the nav on scroll down and restores on top", () => {
    const nav = document.getElementById("main-nav")!;

    notifyListeners(100);
    expect(nav.style.transform).toBe("translateY(-100%)");

    notifyListeners(10);
    expect(nav.style.transform).toBe("translateY(0)");
  });

  it("does not auto-hide while the mobile menu is open", () => {
    const nav = document.getElementById("main-nav")!;
    const btn = document.getElementById("menu-btn")!;

    notifyListeners(5);
    expect(nav.style.transform).toBe("translateY(0)");

    btn.click();
    notifyListeners(300);
    expect(nav.style.transform).toBe("translateY(0)");
  });

  it("removes listeners on destroy", () => {
    const html = document.documentElement;
    destroyNav();

    const darkBtn = document.getElementById("dark-toggle")!;
    darkBtn.click();
    expect(html.classList.contains("dark")).toBe(false);
  });
});