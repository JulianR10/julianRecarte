type InitFn = () => void;
type DestroyFn = () => void;

interface Lifecycle {
  init: InitFn;
  destroy: DestroyFn;
}

// Un solo par de listeners para todos los componentes. `name` deduplica: si el
// <script> se re-evalúa tras una navegación, el par nuevo reemplaza al anterior
// en vez de sumarse (evita N× initAll / N× initNav).
const registry = new Map<string, Lifecycle>();
let bound = false;

/**
 * Registra un par init/destroy sobre los eventos de ViewTransitions.
 *
 * - `astro:before-swap` → llama a todos los `destroy()`.
 * - `astro:page-load`   → llama a todos los `init()`.
 */
export function createLifecycle(name: string, init: InitFn, destroy: DestroyFn): Lifecycle {
  registry.set(name, { init, destroy });

  if (!bound) {
    bound = true;
    document.addEventListener("astro:before-swap", () => {
      registry.forEach((entry) => entry.destroy());
    });
    document.addEventListener("astro:page-load", () => {
      registry.forEach((entry) => entry.init());
    });
  }

  return { init, destroy };
}
