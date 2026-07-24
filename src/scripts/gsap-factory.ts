import gsap from "gsap";

export type GsapSetup = (gsap: typeof gsap, ...rest: unknown[]) => void;

export interface AnimationModule {
  init(gsap: typeof gsap, ...rest: unknown[]): void;
  destroy(): void;
}

export function defineAnimation(
  setup: GsapSetup,
  { checkReducedMotion = true }: { checkReducedMotion?: boolean } = {}
): AnimationModule {
  let ctx: gsap.Context | null = null;

  return {
    init(gsap: typeof gsap, ...rest: unknown[]) {
      if (checkReducedMotion && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      if (ctx) return;
      ctx = gsap.context(() => setup(gsap, ...rest));
    },
    destroy() {
      if (ctx) {
        ctx.kill();
        ctx = null;
      }
    },
  };
}
