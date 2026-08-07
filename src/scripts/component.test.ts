import { describe, it, expect, vi } from "vitest";
import { defineComponent } from "@scripts/component";

describe("defineComponent", () => {
  it("runs setup on init and cleanup on destroy", () => {
    const setup = vi.fn(() => () => {});
    const comp = defineComponent("t", setup);

    comp.init();
    expect(setup).toHaveBeenCalledTimes(1);
    comp.destroy();
    comp.init();
    expect(setup).toHaveBeenCalledTimes(2);
  });

  it("is idempotent: repeated init without destroy runs setup once", () => {
    const setup = vi.fn(() => () => {});
    const comp = defineComponent("t", setup);
    comp.init();
    comp.init();
    expect(setup).toHaveBeenCalledTimes(1);
  });

  it("calls the returned cleanup on destroy", () => {
    const cleanup = vi.fn();
    const comp = defineComponent("t", () => cleanup);
    comp.init();
    comp.destroy();
    expect(cleanup).toHaveBeenCalledTimes(1);
    // destroy again does nothing
    comp.destroy();
    expect(cleanup).toHaveBeenCalledTimes(1);
  });

  it("swallows cleanup errors but still resets state", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const comp = defineComponent("t", () => () => { throw new Error("boom"); });
    comp.init();
    comp.destroy();
    expect(warn).toHaveBeenCalled();
    // state reset: can re-init and setup again
    comp.init();
    expect(comp.name).toBe("t");
    warn.mockRestore();
  });

  it("passes an injectable root scope", () => {
    const root = document.createElement("div");
    let received: unknown;
    const comp = defineComponent("t", (r) => { received = r; }, { root });
    comp.init();
    expect(received).toBe(root);
  });

  it("resolves a string selector to its element", () => {
    const el = document.createElement("div");
    el.id = "target";
    document.body.appendChild(el);
    let received: unknown;
    const comp = defineComponent("t", (r) => { received = r; }, { root: "#target" });
    comp.init();
    expect(received).toBe(el);
  });

  it("defaults to document when no root is given", () => {
    let received: unknown;
    const comp = defineComponent("t", (r) => { received = r; });
    comp.init();
    expect(received).toBe(document);
  });
});