import gsap from "gsap";

export type GsapSetup = (gsap: typeof gsap, ...rest: unknown[]) => (() => void) | void;

export interface AnimationModule {
  init(gsap: typeof gsap, ...rest: unknown[]): void;
  destroy(): void;
}

export function defineAnimation(
  setup: GsapSetup,
  { checkReducedMotion = true }: { checkReducedMotion?: boolean } = {}
): AnimationModule {
  let ctx: gsap.Context | null = null;
  let cleanup: (() => void) | null = null;

  return {
    init(gsap: typeof gsap, ...rest: unknown[]) {
      if (checkReducedMotion && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      if (ctx) return;
      let cleanupFn: (() => void) | void;
      ctx = gsap.context(() => {
        cleanupFn = setup(gsap, ...rest);
      });
      cleanup = cleanupFn ?? null;
    },
    destroy() {
      if (cleanup) {
        cleanup();
        cleanup = null;
      }
      if (ctx) {
        ctx.kill();
        ctx = null;
      }
    },
  };
}
