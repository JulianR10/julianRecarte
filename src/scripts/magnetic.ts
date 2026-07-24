import gsap from "gsap";
import { defineAnimation } from "@scripts/gsap-factory";

export const magnetic = defineAnimation((_gsap: typeof gsap) => {
  const buttons = document.querySelectorAll<HTMLElement>("[data-magnetic]");
  if (!buttons.length) return;

  const strength = 14;
  const cleanupFns: Array<() => void> = [];

  buttons.forEach((btn) => {
    btn.style.willChange = "transform";

    const onMove = (e: MouseEvent): void => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;

      const dist = Math.sqrt(x * x + y * y);
      const maxDist = Math.max(rect.width, rect.height) * 0.6;
      const factor = Math.min(dist / maxDist, 1);
      const moveX = (x / dist) * strength * factor || 0;
      const moveY = (y / dist) * strength * factor || 0;

      _gsap.to(btn, {
        x: moveX,
        y: moveY,
        duration: 0.4,
        ease: "power2.out",
        overwrite: "auto",
      });
    };

    const onLeave = (): void => {
      _gsap.to(btn, {
        x: 0,
        y: 0,
        duration: 0.6,
        ease: "elastic.out(1, 0.3)",
        overwrite: "auto",
      });
    };

    btn.addEventListener("mousemove", onMove);
    btn.addEventListener("mouseleave", onLeave);

    cleanupFns.push(() => {
      btn.style.willChange = "";
      btn.removeEventListener("mousemove", onMove);
      btn.removeEventListener("mouseleave", onLeave);
    });
  });

  return () => {
    cleanupFns.forEach((fn) => fn());
  };
});
