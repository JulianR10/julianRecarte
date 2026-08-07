export type Scope = Element | Document;

export type ComponentSetup = (root: Scope) => (() => void) | void;

export interface Component {
  readonly name: string;
  init(): void;
  destroy(): void;
}

export interface ComponentOptions {
  root?: Scope | string;
}

export function defineComponent(name: string, setup: ComponentSetup, { root }: ComponentOptions = {}): Component {
  let cleanup: (() => void) | null = null;
  let started = false;

  function resolveRoot(): Scope {
    const r = root;
    if (r && typeof r === "object") return r;
    if (typeof r === "string" && r) return document.querySelector(r) ?? document;
    return document;
  }

  return {
    name,
    init() {
      if (started) return;
      const scope = resolveRoot();
      const result = setup(scope);
      cleanup = typeof result === "function" ? result : null;
      started = true;
    },
    destroy() {
      if (!started) return;
      if (cleanup) {
        try {
          cleanup();
        } catch (e) {
          console.warn(`[component:${name}] cleanup error:`, e);
        }
        cleanup = null;
      }
      started = false;
    },
  };
}
