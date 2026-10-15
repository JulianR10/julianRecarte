import { describe, it, expect, beforeEach, vi } from "vitest";
import { createLifecycle } from "@scripts/lifecycle";

function fire(event: string): void {
  document.dispatchEvent(new Event(event));
}

describe("createLifecycle", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  it("llama a init en astro:page-load y a destroy en astro:before-swap", () => {
    const init = vi.fn();
    const destroy = vi.fn();
    createLifecycle("a", init, destroy);

    fire("astro:page-load");
    expect(init).toHaveBeenCalledTimes(1);

    fire("astro:before-swap");
    expect(destroy).toHaveBeenCalledTimes(1);
  });

  it("no duplica listeners cuando el script se re-evalúa (mismo name)", () => {
    const firstInit = vi.fn();
    const firstDestroy = vi.fn();
    createLifecycle("dup", firstInit, firstDestroy);

    // Simula re-evaluación del <script>: nuevas referencias de función.
    const secondInit = vi.fn();
    const secondDestroy = vi.fn();
    createLifecycle("dup", secondInit, secondDestroy);

    fire("astro:page-load");
    fire("astro:before-swap");

    // Solo el par más reciente debe ejecutarse, una vez cada uno.
    expect(firstInit).not.toHaveBeenCalled();
    expect(firstDestroy).not.toHaveBeenCalled();
    expect(secondInit).toHaveBeenCalledTimes(1);
    expect(secondDestroy).toHaveBeenCalledTimes(1);
  });

  it("ejecuta todos los componentes registrados con names distintos", () => {
    const mainInit = vi.fn();
    const navInit = vi.fn();
    createLifecycle("main-x", mainInit, vi.fn());
    createLifecycle("nav-x", navInit, vi.fn());

    fire("astro:page-load");

    expect(mainInit).toHaveBeenCalledTimes(1);
    expect(navInit).toHaveBeenCalledTimes(1);
  });

  it("devuelve el par init/destroy registrado", () => {
    const init = vi.fn();
    const destroy = vi.fn();
    const lc = createLifecycle("ret", init, destroy);

    expect(lc.init).toBe(init);
    expect(lc.destroy).toBe(destroy);
  });
});
