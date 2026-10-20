// Retrato del hero de la home. Lo comparten <Image> (Hero.astro) y el preload
// (pages/[lang]/index.astro): si difieren, el navegador baja la imagen dos veces.
//
// Hay dos <img>: el de mobile (< xl) y el de desktop (xl+). Cada `sizes` cae a
// 1px en el breakpoint donde su <img> está oculto, así pide la variante mínima
// en vez de la grande. Los anchos incluyen el `scale-*` del recorte.

export const HERO_WIDTHS = [320, 480, 640, 800, 1024];

/** Mobile: w-44 (176px) / sm:w-56 (224px) × scale 1.78. */
export const HERO_SIZES_MOBILE = "(min-width: 1280px) 1px, (min-width: 640px) 400px, 314px";

/** Desktop: xl:w-[28rem] (448px) × scale 1.38. */
export const HERO_SIZES_DESKTOP = "(min-width: 1280px) 620px, 1px";

export const HERO_MEDIA_MOBILE = "(max-width: 1279.98px)";
export const HERO_MEDIA_DESKTOP = "(min-width: 1280px)";
