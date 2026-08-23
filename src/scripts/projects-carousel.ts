import { defineComponent } from "@scripts/component";
import gsap from "gsap";

function updateDots(active: number): void {
  document.querySelectorAll<HTMLElement>(".project-dot").forEach((dot, i) => {
    if (i === active) {
      dot.classList.remove("bg-copy/20", "dark:bg-dark-muted/20");
      dot.classList.add("bg-accent-orange", "scale-125");
    } else {
      dot.classList.add("bg-copy/20", "dark:bg-dark-muted/20");
      dot.classList.remove("bg-accent-orange", "scale-125");
    }
  });
}

export const projectsCarousel = defineComponent("projects-carousel", () => {
  if (window.matchMedia("(min-width: 768px)").matches) return;

  const track = document.getElementById("projects-track")!;
  const dots = Array.from(document.querySelectorAll<HTMLElement>(".project-dot"));
  if (!track || !dots.length) return;

  const card = track.querySelector<HTMLElement>("[data-project-card]");
  const step = card ? card.offsetWidth + 16 : track.offsetWidth;
  const total = dots.length;

  let lastIndex = 0;
  let scrollRaf = 0;

  function currentIndex(): number {
    return Math.round(track.scrollLeft / step);
  }

  function onScroll(): void {
    cancelAnimationFrame(scrollRaf);
    scrollRaf = requestAnimationFrame(() => {
      const idx = Math.min(total - 1, Math.max(0, currentIndex()));
      if (idx !== lastIndex) {
        lastIndex = idx;
        updateDots(idx);
      }
    });
  }

  const dotHandlers: (() => void)[] = [];
  dots.forEach((dot) => {
    const handler = () => {
      const idx = parseInt(dot.dataset.index || "0", 10);
      track.scrollTo({ left: idx * step, behavior: "smooth" });
    };
    dot.addEventListener("click", handler);
    dotHandlers.push(handler);
  });

  track.addEventListener("scroll", onScroll, { passive: true });
  updateDots(lastIndex);

  // ---- Edge bounce (ambas puntas, solo mobile) ----
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let bounceCleanup: (() => void) | null = null;

  if (!prefersReduced) {
    // Evita doble rebote nativo (glow iOS/Android) y que compita con el elástico custom
    const prevOverscroll = track.style.overscrollBehaviorX;
    track.style.overscrollBehaviorX = "none";

    let startX = 0;
    let startScroll = 0;
    let dragging = false;
    let overshoot = 0;
    let isOverscrolling = false;
    let activePointerId: number | null = null;

    const RESISTANCE = 0.55;
    const MAX_OVER = 130;

    function maxScroll(): number {
      return Math.max(0, track.scrollWidth - track.clientWidth);
    }

    function killBounceTweens(): void {
      gsap.killTweensOf(track);
    }

    const onPointerDown = (e: PointerEvent): void => {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      // Solo nos interesa si estamos en un borde; si no, dejamos el scroll nativo libre
      const max = maxScroll();
      const atStart = track.scrollLeft <= 2;
      const atEnd = track.scrollLeft >= max - 2;
      if (!atStart && !atEnd) return;

      startX = e.clientX;
      startScroll = track.scrollLeft;
      dragging = true;
      isOverscrolling = false;
      overshoot = 0;
      activePointerId = e.pointerId;
      killBounceTweens();
      try {
        track.setPointerCapture(e.pointerId);
      } catch {}
    };

    const onPointerMove = (e: PointerEvent): void => {
      if (!dragging || activePointerId !== e.pointerId) return;
      const max = maxScroll();
      const atStart = startScroll <= 2;
      const atEnd = startScroll >= max - 2;
      const delta = e.clientX - startX;

      const pullingBeyondStart = atStart && delta > 0;
      const pullingBeyondEnd = atEnd && delta < 0;

      if (pullingBeyondStart || pullingBeyondEnd) {
        // Estamos tirando más allá del borde -> modo elástico
        if (!isOverscrolling) {
          isOverscrolling = true;
          // Desactiva snap durante el estiramiento para que no "pelee" con el transform
          track.style.scrollSnapType = "none";
        }
        // Resistencia + clamp
        let raw = delta * RESISTANCE;
        raw = Math.max(-MAX_OVER, Math.min(MAX_OVER, raw));
        overshoot = raw;
        gsap.set(track, { x: overshoot });
        // Evita que el navegador haga scroll nativo / pull mientras estiramos
        e.preventDefault();
      } else if (isOverscrolling) {
        // El usuario volvió hacia dentro: resetea
        isOverscrolling = false;
        overshoot = 0;
        gsap.set(track, { x: 0 });
        track.style.scrollSnapType = "";
      }
    };

    const finishOverscroll = (e?: PointerEvent): void => {
      if (!dragging) return;
      dragging = false;
      if (e && activePointerId !== null && e.pointerId !== activePointerId) return;
      if (activePointerId !== null && e) {
        try {
          if (track.hasPointerCapture(activePointerId)) track.releasePointerCapture(activePointerId);
        } catch {}
      }
      activePointerId = null;

      if (isOverscrolling || overshoot !== 0) {
        isOverscrolling = false;
        gsap.to(track, {
          x: 0,
          duration: 0.78,
          ease: "elastic.out(1, 0.32)",
          overwrite: true,
          onComplete: () => {
            track.style.scrollSnapType = "";
            gsap.set(track, { x: 0 });
          },
        });
      } else {
        track.style.scrollSnapType = "";
      }
      overshoot = 0;
    };

    const onPointerCancel = (e: PointerEvent): void => finishOverscroll(e);

    // passive:false necesario para que preventDefault funcione en el pull
    track.addEventListener("pointerdown", onPointerDown);
    track.addEventListener("pointermove", onPointerMove, { passive: false });
    track.addEventListener("pointerup", finishOverscroll);
    track.addEventListener("pointercancel", onPointerCancel);
    // Si el dedo sale del track, también soltamos
    track.addEventListener("pointerleave", finishOverscroll);

    bounceCleanup = () => {
      track.removeEventListener("pointerdown", onPointerDown);
      track.removeEventListener("pointermove", onPointerMove);
      track.removeEventListener("pointerup", finishOverscroll);
      track.removeEventListener("pointercancel", onPointerCancel);
      track.removeEventListener("pointerleave", finishOverscroll);
      killBounceTweens();
      gsap.set(track, { x: 0 });
      track.style.scrollSnapType = "";
      track.style.overscrollBehaviorX = prevOverscroll;
    };
  }

  return () => {
    track.removeEventListener("scroll", onScroll);
    dotHandlers.forEach((h, i) => dots[i]?.removeEventListener("click", h));
    cancelAnimationFrame(scrollRaf);
    if (bounceCleanup) bounceCleanup();
  };
});
