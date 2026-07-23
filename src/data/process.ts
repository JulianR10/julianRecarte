import type { ImageMetadata } from "astro";
import briefingImg from "@assets/images/briefing.webp";
import bocetoImg from "@assets/images/boceto.webp";
import desarrolloImg from "@assets/images/desarrollo.webp";
import iteracionImg from "@assets/images/iteracion.webp";

export interface ProcessStepData {
  num: string;
  gradient: string;
  image: ImageMetadata;
}

export const steps: ProcessStepData[] = [
  {
    num: "01",
    gradient: "linear-gradient(135deg, rgba(var(--rgb-accent-orange),0.3), rgba(var(--rgb-accent-orange),0.05), rgba(var(--rgb-accent-purple),0.15))",
    image: briefingImg,
  },
  {
    num: "02",
    gradient: "linear-gradient(135deg, rgba(var(--rgb-accent-purple),0.3), rgba(var(--rgb-accent-purple),0.05), rgba(var(--rgb-accent-orange),0.15))",
    image: bocetoImg,
  },
  {
    num: "03",
    gradient: "linear-gradient(135deg, rgba(var(--rgb-accent-orange),0.2), rgba(242,236,228,0.3), rgba(var(--rgb-accent-purple),0.25))",
    image: desarrolloImg,
  },
  {
    num: "04",
    gradient: "linear-gradient(135deg, rgba(var(--rgb-accent-purple),0.2), rgba(var(--rgb-accent-orange),0.1), rgba(242,236,228,0.3))",
    image: iteracionImg,
  },
];
