type InitFn = () => void;
type DestroyFn = () => void;

export function createLifecycle(init: InitFn, destroy: DestroyFn): { init: InitFn; destroy: DestroyFn } {
  document.addEventListener("astro:before-swap", () => {
    destroy();
  });

  document.addEventListener("astro:page-load", () => {
    init();
  });

  return { init, destroy };
}
