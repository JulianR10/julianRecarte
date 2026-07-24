import { onScroll } from "@scripts/scroll-source";
import { scrollToTop } from "@scripts/lenis-adapter";

let scrollCleanup: (() => void) | null = null;

export function initBackToTop(): () => void {
  const btn = document.getElementById("btn-top")!;
  const arrow = document.getElementById("arrow-top")!;
  if (!btn || !arrow) return () => {};

  scrollCleanup = onScroll((y: number) => {
    if (y > 400) {
      btn.classList.remove("translate-y-20", "opacity-0", "pointer-events-none");
      btn.classList.add("translate-y-0", "opacity-100");
    } else {
      btn.classList.remove("translate-y-0", "opacity-100");
      btn.classList.add("translate-y-20", "opacity-0", "pointer-events-none");
    }
  });

  const onEnter = (): void => {
    arrow.style.transition = "transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)";
    arrow.style.transform = "scaleY(0.6)";
  };
  const onLeave = (): void => { arrow.style.transform = "scaleY(1)"; };
  const onClick = (): void => {
    const rect = btn.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const colors = ["#FF5C2B", "#5B1FFF", "#FF7A4F", "#8A5CFF"];

    for (let i = 0; i < 24; i++) {
      const dot = document.createElement("span");
      const angle = (Math.PI * 2 * i) / 24;
      const dist = 60 + Math.random() * 80;
      const size = 3 + Math.random() * 5;
      const dx = Math.cos(angle) * dist;
      const dy = Math.sin(angle) * dist;
      dot.style.cssText = `
        position: fixed; left: ${cx}px; top: ${cy}px; z-index: 9999;
        width: ${size}px; height: ${size}px; border-radius: 50%;
        background: ${colors[i % colors.length]};
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

    btn.style.transition = "transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.4s ease";
    btn.style.transform = "translateY(-100px) scale(0.6)";
    btn.style.opacity = "0";
    setTimeout(() => {
      scrollToTop();
    }, 150);
    setTimeout(() => {
      btn.style.transition = "transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.5s ease";
      btn.style.transform = "translateY(0) scale(1)";
      btn.style.opacity = "1";
      arrow.style.transform = "scaleY(1)";
    }, 700);
  };

  btn.addEventListener("mouseenter", onEnter);
  btn.addEventListener("mouseleave", onLeave);
  btn.addEventListener("click", onClick);

  return () => {
    btn.removeEventListener("mouseenter", onEnter);
    btn.removeEventListener("mouseleave", onLeave);
    btn.removeEventListener("click", onClick);
    if (scrollCleanup) scrollCleanup();
    scrollCleanup = null;
  };
}

export function destroyBackToTop(): void {
  if (scrollCleanup) {
    scrollCleanup();
    scrollCleanup = null;
  }
}
