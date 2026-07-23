let cleanup = null;

export function initTestimonials() {
  const cards = document.querySelectorAll(".testimonio-card");
  const prevBtn = document.getElementById("test-prev");
  const nextBtn = document.getElementById("test-next");
  const track = document.getElementById("testimonios-track");
  if (!cards.length || !prevBtn || !nextBtn || !track) return;

  let active = 0;
  let locked = false;
  let lockTimer = null;

  function setState(card, state) {
    card.classList.remove("card-active", "card-peek-right", "card-peek-left", "card-hidden");
    const map = { active: "card-active", "peek-right": "card-peek-right", "peek-left": "card-peek-left" };
    card.classList.add(map[state] || "card-hidden");
  }

  function layout() {
    cards.forEach((card, i) => {
      if (i === active) setState(card, "active");
      else if (i === (active + 1) % cards.length) setState(card, "peek-right");
      else if (i === (active - 1 + cards.length) % cards.length) setState(card, "peek-left");
      else setState(card, "hidden");
    });
  }

  function show(index) {
    if (locked || index === active) return;
    locked = true;
    active = index;
    layout();
    lockTimer = setTimeout(() => { locked = false; }, 500);
  }

  const onPrev = () => show(active === 0 ? cards.length - 1 : active - 1);
  const onNext = () => show(active === cards.length - 1 ? 0 : active + 1);

  prevBtn.addEventListener("click", onPrev);
  nextBtn.addEventListener("click", onNext);

  let startX = 0;
  const onPointerDown = (e) => { startX = e.clientX; track.setPointerCapture(e.pointerId); };
  const onPointerUp = (e) => {
    const delta = e.clientX - startX;
    if (Math.abs(delta) > 40) {
      const dir = delta < 0 ? (active + 1) % cards.length : active === 0 ? cards.length - 1 : active - 1;
      show(dir);
    }
  };
  track.addEventListener("pointerdown", onPointerDown);
  track.addEventListener("pointerup", onPointerUp);
  track.style.touchAction = "pan-y";

  layout();

  cleanup = () => {
    prevBtn.removeEventListener("click", onPrev);
    nextBtn.removeEventListener("click", onNext);
    track.removeEventListener("pointerdown", onPointerDown);
    track.removeEventListener("pointerup", onPointerUp);
    if (lockTimer) clearTimeout(lockTimer);
    locked = false;
    lockTimer = null;
  };
}

export function destroyTestimonials() {
  if (cleanup) {
    cleanup();
    cleanup = null;
  }
}