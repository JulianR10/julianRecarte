import gsap from "gsap";
import { defineComponent } from "@scripts/component";
import { onScroll } from "@scripts/scroll-source";
import { scrollToTop } from "@scripts/lenis-adapter";

const THRESHOLD = 400;
const SHOW_CLASSES = ["translate-y-0", "opacity-100"];
const HIDE_CLASSES = ["translate-y-20", "opacity-0", "pointer-events-none"];
const BURST_COLORS = ["#FF5C2B", "#5B1FFF", "#FF7A4F", "#8A5CFF"];
const BURST_COUNT = 24;

export const backToTop = defineComponent("back-to-top", () => {
  const btn = document.getElementById("btn-top");
  const arrow = document.getElementById("arrow-top");
  const wa = document.getElementById("btn-whatsapp");
  if (!btn || !arrow) return;

  const setVisible = (visible: boolean): void => {
    [btn, wa].forEach((el) => {
      if (!el) return;
      el.classList.remove(...(visible ? HIDE_CLASSES : SHOW_CLASSES));
      el.classList.add(...(visible ? SHOW_CLASSES : HIDE_CLASSES));
    });
  };

  let currentY = 0;
  const scrollCleanup = onScroll((y: number) => {
    currentY = y;
    setVisible(y > THRESHOLD);
  });

  const onEnter = (): void => {
    arrow.style.transition = "transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)";
    arrow.style.transform = "scaleY(0.6)";
  };
  const onLeave = (): void => {
    arrow.style.transform = "scaleY(1)";
  };

  const burst = (): void => {
    const rect = btn.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;

    for (let i = 0; i < BURST_COUNT; i++) {
      const dot = document.createElement("span");
      const angle = (Math.PI * 2 * i) / BURST_COUNT;
      const dist = 60 + Math.random() * 80;
      const size = 3 + Math.random() * 5;
      const dx = Math.cos(angle) * dist;
      const dy = Math.sin(angle) * dist;
      dot.style.cssText = `
        position: fixed; left: ${cx}px; top: ${cy}px; z-index: 9999;
        width: ${size}px; height: ${size}px; border-radius: 50%;
        background: ${BURST_COLORS[i % BURST_COLORS.length]};
        pointer-events: none;
        transition: all 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        opacity: 1;
      `;
      document.body.appendChild(dot);
      requestAnimationFrame(() => {
        dot.style.transform = `translate(${dx}px, ${dy}px) scale(0.3)`;
        dot.style.opacity = "0";
      });
      setTimeout(() => dot.remove(), 800);
    }
  };

  const flyToTop = (): void => {
    gsap.to(btn, {
      y: -100,
      scale: 0.6,
      opacity: 0,
      duration: 0.3,
      ease: "cubic-bezier(0.34, 1.56, 0.64, 1)",
    });
    setTimeout(() => scrollToTop(), 150);
    setTimeout(() => {
      gsap.to(btn, {
        y: 0,
        scale: 1,
        opacity: 1,
        duration: 0.5,
        ease: "cubic-bezier(0.34, 1.56, 0.64, 1)",
        onComplete: () => {
          gsap.set(btn, { clearProps: "transform,opacity" });
          arrow.style.transition = "";
          arrow.style.transform = "";
          setVisible(currentY > THRESHOLD);
        },
      });
    }, 700);
  };

  const onClick = (): void => {
    burst();
    flyToTop();
  };

  btn.addEventListener("mouseenter", onEnter);
  btn.addEventListener("mouseleave", onLeave);
  btn.addEventListener("click", onClick);

  return () => {
    scrollCleanup();
    btn.removeEventListener("mouseenter", onEnter);
    btn.removeEventListener("mouseleave", onLeave);
    btn.removeEventListener("click", onClick);
  };
});
