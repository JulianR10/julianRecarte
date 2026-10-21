// Retrato del hero de la home. Lo comparten <Image> (Hero.astro) y el preload
// (pages/[lang]/index.astro): si difieren, el navegador baja la imagen dos veces.
//
// Hay dos <img>: el de mobile (< 900px) y el de desktop (900px+). Cada `sizes` cae a
// 1px en el breakpoint donde su <img> está oculto, así pide la variante mínima
// en vez de la grande. Los anchos incluyen el `scale-*` del recorte.
// 900px (no lg) para que la pantalla interior de un plegable en horizontal (~1000px)
// ya ponga la foto al costado: apilada no entran los CTA en el alto.

export const HERO_WIDTHS = [320, 480, 640, 800, 1024];

/** Mobile: w-44 (176px) / sm:w-56 (224px) × scale 1.78. */
export const HERO_SIZES_MOBILE = "(min-width: 900px) 1px, (min-width: 640px) 400px, 314px";

/** Desktop: w-80 (320px) / xl:w-[28rem] (448px) × scale 1.38. */
export const HERO_SIZES_DESKTOP = "(min-width: 1280px) 620px, (min-width: 900px) 442px, 1px";

export const HERO_MEDIA_MOBILE = "(max-width: 899.98px)";
export const HERO_MEDIA_DESKTOP = "(min-width: 900px)";
