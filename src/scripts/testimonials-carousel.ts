import { defineComponent } from "@scripts/component";

function updateDots(active: number): void {
  const dots = document.querySelectorAll<HTMLElement>(".test-dot");
  dots.forEach((dot, i) => {
    if (i === active) {
      dot.classList.remove("bg-copy/20", "dark:bg-dark-muted/20");
      dot.classList.add("bg-accent-orange", "scale-125");
      dot.setAttribute("aria-current", "true");
    } else {
      dot.classList.add("bg-copy/20", "dark:bg-dark-muted/20");
      dot.classList.remove("bg-accent-orange", "scale-125");
      dot.removeAttribute("aria-current");
    }
  });
}

export const testimonialsCarousel = defineComponent("testimonials-carousel", () => {
  const cards = document.querySelectorAll<HTMLElement>(".testimonio-card");
  const prevBtn = document.getElementById("test-prev")!;
  const nextBtn = document.getElementById("test-next")!;
  const track = document.getElementById("testimonios-track")!;
  const region = document.getElementById("testimonios");
  if (!cards.length || !prevBtn || !nextBtn || !track || !region) return;

  let active = 0;
  let locked = false;
  let lockTimer: ReturnType<typeof setTimeout> | null = null;

  function setState(card: Element, state: string): void {
    card.classList.remove("card-active", "card-peek-right", "card-peek-left", "card-hidden");
    const map: Record<string, string> = { active: "card-active", "peek-right": "card-peek-right", "peek-left": "card-peek-left" };
    card.classList.add(map[state] || "card-hidden");
  }

  function layout(): void {
    cards.forEach((card, i) => {
      let state = "hidden";
      if (i === active) state = "active";
      else if (i === (active + 1) % cards.length) state = "peek-right";
      else if (i === (active - 1 + cards.length) % cards.length) state = "peek-left";
      setState(card, state);

      // Solo la tarjeta activa es alcanzable: las de peek están apiladas
      // detrás y las ocultas tienen opacity 0. Sin inert, Tab y el lector de
      // pantalla las recorren igual (y se oyen testimonios que no se ven).
      if (state === "active") {
        card.removeAttribute("inert");
        card.removeAttribute("aria-hidden");
      } else {
        card.setAttribute("inert", "");
        card.setAttribute("aria-hidden", "true");
      }
    });
    updateDots(active);
  }

  function show(index: number): void {
    if (locked || index === active) return;
    locked = true;
    active = index;
    layout();
    lockTimer = setTimeout(() => { locked = false; }, 500);
  }

  const onPrev = (): void => show(active === 0 ? cards.length - 1 : active - 1);
  const onNext = (): void => show(active === cards.length - 1 ? 0 : active + 1);

  prevBtn.addEventListener("click", onPrev);
  nextBtn.addEventListener("click", onNext);

  const dots = document.querySelectorAll<HTMLElement>(".test-dot");
  const dotHandlers: (() => void)[] = [];
  dots.forEach((dot) => {
    const handler = () => {
      const idx = parseInt(dot.dataset.index || "0");
      show(idx);
    };
    dot.addEventListener("click", handler);
    dotHandlers.push(handler);
  });

  let startX = 0;
  const onPointerDown = (e: PointerEvent): void => { startX = e.clientX; track.setPointerCapture(e.pointerId); };
  const onPointerUp = (e: PointerEvent): void => {
    const delta = e.clientX - startX;
    if (Math.abs(delta) > 40) {
      const dir = delta < 0 ? (active + 1) % cards.length : active === 0 ? cards.length - 1 : active - 1;
      show(dir);
    }
  };
  track.addEventListener("pointerdown", onPointerDown);
  track.addEventListener("pointerup", onPointerUp);
  track.style.touchAction = "pan-y";

  // Teclado: ← → cuando el foco está dentro de la sección (contenedor del
  // carrusel, flechas o puntos). Fuera de ella no interceptamos, para no
  // pisar el scroll por teclado de la página.
  const onKeydown = (e: KeyboardEvent): void => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      onPrev();
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      onNext();
    }
  };
  region.addEventListener("keydown", onKeydown);

  layout();

  return () => {
    prevBtn.removeEventListener("click", onPrev);
    nextBtn.removeEventListener("click", onNext);
    track.removeEventListener("pointerdown", onPointerDown);
    track.removeEventListener("pointerup", onPointerUp);
    region.removeEventListener("keydown", onKeydown);
    dotHandlers.forEach((h, i) => dots[i]?.removeEventListener("click", h));
    if (lockTimer) clearTimeout(lockTimer);
    locked = false;
    lockTimer = null;
  };
});
