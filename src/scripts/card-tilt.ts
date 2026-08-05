import type gsap from "gsap";
import { defineAnimation } from "@scripts/gsap-factory";

export const cardTilt = defineAnimation((gsap: typeof gsap) => {
  const cards = document.querySelectorAll<HTMLElement>("[data-project-card]");
  if (!cards.length) return;
  if (window.matchMedia("(hover: none)").matches) return;

  const cleanupFns: (() => void)[] = [];

  cards.forEach((card) => {
    const shine = card.querySelector<HTMLElement>("[data-card-shine]");

    const onMove = (e: MouseEvent): void => {
      if (card.dataset.tiltDisabled === "true") return;
      card.style.willChange = "transform";
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const rotX = gsap.utils.mapRange(0, rect.height, 6, -6, y);
      const rotY = gsap.utils.mapRange(0, rect.width, -6, 6, x);

      gsap.to(card, {
        rotationX: rotX,
        rotationY: rotY,
        transformPerspective: 1000,
        duration: 0.4,
        ease: "power2.out",
        overwrite: "auto",
      });

      if (shine) {
        const px = 100 - (x / rect.width) * 100;
        const py = 100 - (y / rect.height) * 100;
        shine.style.opacity = "1";
        shine.style.background =
          `radial-gradient(circle at ${px}% ${py}%, rgba(255,255,255,0.03) 0%, transparent 60%)`;
      }
    };

    const onLeave = (): void => {
      card.style.willChange = "";
      gsap.to(card, {
        rotationX: 0,
        rotationY: 0,
        transformPerspective: 1000,
        duration: 0.5,
        ease: "power2.out",
        overwrite: "auto",
      });

      if (shine) shine.style.opacity = "0";
    };

    card.addEventListener("mousemove", onMove);
    card.addEventListener("mouseleave", onLeave);
    cleanupFns.push(() => {
      card.removeEventListener("mousemove", onMove);
      card.removeEventListener("mouseleave", onLeave);
    });
  });

  return () => cleanupFns.forEach((fn) => fn());
});
