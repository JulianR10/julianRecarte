/**
 * generate-og.mjs — genera las imágenes Open Graph (1200×630) del sitio.
 *
 * Uso: node scripts/generate-og.mjs   (requiere `sharp`, ya es dependencia)
 * Salida: public/og-cover.jpg, public/og-triba.jpg, public/og-multiservizi.jpg
 *
 * Es una herramienta local (no corre en el build de Vercel). Si cambiás el
 * nombre/rol o los proyectos, corré de nuevo el script.
 */
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const require = createRequire(import.meta.url);
const sharp = require("sharp");

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = resolve(__dirname, "..", "public");

const W = 1200;
const H = 630;
/**
 * El rasterizador de sharp (librsvg) solo ve fuentes **instaladas en el sistema**,
 * no las webfonts del sitio (Fontshare/Google). Por eso las marcas del sitio van
 * primero (se usan si están instaladas) y Arial queda como último recurso.
 */
const FONT = "Satoshi, 'Bricolage Grotesque', Arial, sans-serif";

const beige = "#E8E0D0";
const ink = "#1A1613";
const orange = "#FF5C2B";
const warm = "#FF7A4F";
const purple = "#5B1FFF";

/** Blobs decorativos tipo "orb" (coherentes con el hero). */
function blobs(c1, c2, o1 = 0.16, o2 = 0.1) {
  return `
    <defs>
      <radialGradient id="b1" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="${c1}" stop-opacity="${o1}"/>
        <stop offset="100%" stop-color="${c1}" stop-opacity="0"/>
      </radialGradient>
      <radialGradient id="b2" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="${c2}" stop-opacity="${o2}"/>
        <stop offset="100%" stop-color="${c2}" stop-opacity="0"/>
      </radialGradient>
      <linearGradient id="bar" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="${orange}"/>
        <stop offset="100%" stop-color="${purple}"/>
      </linearGradient>
    </defs>
    <rect width="${W}" height="${H}" fill="${beige}"/>
    <circle cx="140" cy="80" r="360" fill="url(#b1)"/>
    <circle cx="1080" cy="580" r="420" fill="url(#b2)"/>`;
}

/** Monograma JR igual que public/favicon.svg. */
function monogram(x, y, size = 76) {
  const s = size / 64;
  return `
    <g transform="translate(${x} ${y}) scale(${s})">
      <rect width="64" height="64" rx="14" fill="${ink}"/>
      <text x="22" y="46" font-family="${FONT}" font-weight="800" font-size="38" text-anchor="middle" fill="#F2ECE4">J</text>
      <text x="40" y="46" font-family="${FONT}" font-weight="800" font-size="38" text-anchor="middle" fill="${orange}">R</text>
    </g>`;
}

function wrapSvg(body) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${body}
    <rect x="0" y="${H - 10}" width="${W}" height="10" fill="url(#bar)"/>
  </svg>`;
}

/** Portada principal (home). */
function coverSvg() {
  return wrapSvg(`
    ${blobs(orange, purple)}
    ${monogram(80, 72)}
    <text x="180" y="112" font-family="${FONT}" font-size="26" font-weight="700" letter-spacing="6" fill="${orange}">PORTFOLIO</text>
    <text x="180" y="146" font-family="${FONT}" font-size="22" letter-spacing="2" fill="${ink}" fill-opacity="0.55">Desarrollador Web FullStack</text>

    <text x="80" y="330" font-family="${FONT}" font-size="104" font-weight="800" fill="${ink}">Julián Recarte</text>

    <text x="82" y="410" font-family="${FONT}" font-size="42" font-weight="600" fill="${orange}">Sitios y apps web a medida</text>

    <text x="82" y="490" font-family="${FONT}" font-size="27" fill="${ink}" fill-opacity="0.6">Astro · GSAP · Tailwind CSS · Supabase</text>

    <text x="82" y="548" font-family="${FONT}" font-size="24" font-weight="700" letter-spacing="1" fill="${ink}" fill-opacity="0.75">julianrecarte.dev</text>
  `);
}

/** Portada de case study, tintada con el acento del proyecto. */
function caseSvg({ title, subtitle, accent, eyebrow = "CASO DE ESTUDIO" }) {
  return wrapSvg(`
    ${blobs(accent, accent, 0.22, 0.14)}
    ${monogram(80, 72)}
    <text x="180" y="112" font-family="${FONT}" font-size="26" font-weight="700" letter-spacing="6" fill="${accent}">${eyebrow}</text>
    <text x="180" y="146" font-family="${FONT}" font-size="22" letter-spacing="2" fill="${ink}" fill-opacity="0.55">Julián Recarte</text>

    <text x="80" y="336" font-family="${FONT}" font-size="96" font-weight="800" fill="${ink}">${title}</text>

    <text x="82" y="404" font-family="${FONT}" font-size="32" font-weight="500" fill="${ink}" fill-opacity="0.7">${subtitle}</text>

    <text x="82" y="520" font-family="${FONT}" font-size="24" font-weight="700" letter-spacing="1" fill="${ink}" fill-opacity="0.75">julianrecarte.dev</text>
  `);
}

const jobs = [
  { out: "og-cover.jpg", svg: coverSvg() },
  {
    out: "og-triba.jpg",
    svg: caseSvg({
      title: "Triba",
      subtitle: "Revista digital con suscripciones y newsletter",
      accent: "#DE062E",
    }),
  },
  {
    out: "og-multiservizi.jpg",
    svg: caseSvg({
      title: "Multiservizi SRL",
      subtitle: "Plataforma mayorista con catálogo y paneles",
      accent: "#800020",
    }),
  },
];

for (const job of jobs) {
  const file = resolve(outDir, job.out);
  await sharp(Buffer.from(job.svg))
    .jpeg({ quality: 90, mozjpeg: true })
    .toFile(file);
  const meta = await sharp(file).metadata();
  console.log(`✓ ${job.out}  ${meta.width}×${meta.height}`);
}
