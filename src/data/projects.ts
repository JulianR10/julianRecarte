import type { ImageMetadata } from "astro";
import logoSP from "@assets/images/logoSP.png";
import tribaLogo from "@assets/images/logoTriba.svg";

export interface Project {
  title: string;
  tags: string[];
  style: string;
  href?: string;
  image?: ImageMetadata;
}

export const projects: Project[] = [
  {
    title: "SP Soluciones Textiles",
    tags: ["Astro", "TailwindCSS", "GSAP"],
    href: "https://julianr10.github.io/sp-soluciones-textiles/",
    image: logoSP,
    style: "radial-gradient(circle at 30% 25%, rgba(255,156,58,0.4), transparent 50%), radial-gradient(circle at 70% 70%, rgba(255,185,110,0.3), transparent 50%), linear-gradient(135deg, rgba(255,220,170,0.2), rgba(255,245,230,0.15))",
  },
  {
    title: "Triba",
    tags: ["Astro", "TailwindCSS", "GSAP"],
    image: tribaLogo,
    style: "radial-gradient(circle at 25% 20%, rgba(222,6,46,0.35), transparent 50%), radial-gradient(circle at 75% 60%, rgba(255,90,125,0.25), transparent 50%), linear-gradient(135deg, rgba(255,195,195,0.2), rgba(255,235,230,0.15))",
  },
  {
    title: "Lumina",
    tags: ["Astro", "GSAP", "Shopify", "TypeScript"],
    style: "linear-gradient(135deg, rgba(var(--rgb-accent-orange),0.3), rgba(242,236,228,0.5), rgba(var(--rgb-accent-purple),0.4))",
  },
];
