import gsap from "gsap";

export type GsapSetup = (gsap: typeof gsap) => (() => void) | void;

export interface AnimationModule {
  init(gsap: typeof gsap): void;
  destroy(): void;
}

export function defineAnimation(
  setup: GsapSetup,
  { checkReducedMotion = true }: { checkReducedMotion?: boolean } = {}
): AnimationModule {
  let ctx: gsap.Context | null = null;
  let cleanup: (() => void) | null = null;

  return {
    init(gsap: typeof gsap) {
      if (checkReducedMotion && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      if (ctx) return;
      let cleanupFn: (() => void) | void;
      ctx = gsap.context(() => {
        cleanupFn = setup(gsap);
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
