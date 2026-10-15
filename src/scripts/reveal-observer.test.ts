import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { revealObserver } from "@scripts/reveal-observer";

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

  trigger(target: Element): void {
    this.callback(
      [{ target, isIntersecting: true } as IntersectionObserverEntry],
      this as unknown as IntersectionObserver
    );
  }
}

function stubReducedMotion(matches: boolean): void {
  const fn = (query: string) => ({
    matches,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  });
  vi.stubGlobal("matchMedia", fn);
  window.matchMedia = fn as unknown as typeof window.matchMedia;
}

describe("revealObserver", () => {
  beforeEach(() => {
    FakeIO.instances = [];
    vi.stubGlobal("IntersectionObserver", FakeIO);
    document.body.innerHTML = `
      <p data-reveal>uno</p>
      <div data-reveal-stagger><span>a</span><span>b</span></div>
    `;
  });

  afterEach(() => {
    revealObserver.destroy();
    vi.unstubAllGlobals();
  });

  it("muestra el contenido de inmediato con prefers-reduced-motion (no queda invisible)", () => {
    stubReducedMotion(true);
    revealObserver.init();

    const revealed = document.querySelectorAll("[data-reveal]");
    expect(revealed.length).toBeGreaterThan(0);
    revealed.forEach((el) => expect(el.classList.contains("revealed")).toBe(true));

    const staggered = document.querySelectorAll("[data-reveal-stagger] > *");
    expect(staggered.length).toBeGreaterThan(0);
    staggered.forEach((el) => expect(el.classList.contains("revealed")).toBe(true));

    // Sin animación no debe crearse ningún observer.
    expect(FakeIO.instances.length).toBe(0);
  });

  it("revela al entrar en viewport cuando hay movimiento normal", () => {
    stubReducedMotion(false);
    revealObserver.init();

    const io = FakeIO.instances[FakeIO.instances.length - 1];
    expect(io).toBeDefined();

    const el = document.querySelector("[data-reveal]")!;
    expect(el.classList.contains("revealed")).toBe(false);

    io.trigger(el);
    expect(el.classList.contains("revealed")).toBe(true);
    expect(io.unobserve).toHaveBeenCalledWith(el);
  });
});
