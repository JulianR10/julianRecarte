import type { ImageMetadata } from "astro";
import logoSP from "@assets/images/logoSP.png";
import tribaLogo from "@assets/images/logoTriba.svg";
import logoMulti from "@assets/images/logoMultiservizi.png";
import celuFirme from "@assets/images/celuFirme.webp";
import celuGirado from "@assets/images/celuGirado.webp";
import tabletVerticalFirme from "@assets/images/tabletVerticalFirme.webp";
import LaptopGirado from "@assets/images/LaptopGirado.webp";

export interface Project {
  title: string;
  tags: string[];
  style: string;
  href?: string;
  image?: ImageMetadata;
  screenshots: ImageMetadata[];
}

export const projects: Project[] = [
  {
    title: "SP Soluciones Textiles",
    tags: ["Tailwind"],
    href: "https://sp-soluciones-textiles.vercel.app/",
    image: logoSP,
    screenshots: [],
    style: "radial-gradient(circle at 30% 25%, rgba(255,156,58,0.4), transparent 50%), radial-gradient(circle at 70% 70%, rgba(255,185,110,0.3), transparent 50%), linear-gradient(135deg, rgba(255,220,170,0.2), rgba(255,245,230,0.15))",
  },
  {
    title: "Triba",
    tags: ["Tailwind"],
    href: "https://triba.vercel.app/",
    image: tribaLogo,
    screenshots: [celuFirme, celuGirado, tabletVerticalFirme, LaptopGirado],
    style: "radial-gradient(circle at 25% 20%, rgba(222,6,46,0.35), transparent 50%), radial-gradient(circle at 75% 60%, rgba(255,90,125,0.25), transparent 50%), linear-gradient(135deg, rgba(255,195,195,0.2), rgba(255,235,230,0.15))",
  },
  {
    title: "Multiservizi SRL",
    tags: ["Tailwind", "Supabase"],
    image: logoMulti,
    screenshots: [],
    style: "radial-gradient(circle at 25% 20%, rgba(128,0,32,0.35), transparent 50%), radial-gradient(circle at 75% 60%, rgba(180,65,85,0.25), transparent 50%), linear-gradient(135deg, rgba(200,140,150,0.15), rgba(245,225,225,0.1))",
  },
];
