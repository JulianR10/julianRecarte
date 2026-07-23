export function initTestimonials() {
  const cards = document.querySelectorAll(".testimonio-card");
  const prev = document.getElementById("test-prev");
  const next = document.getElementById("test-next");
  if (!cards.length) return;

  let active = 0;
  let locked = false;

  function setState(card, state) {
    card.classList.remove("card-active", "card-peek-right", "card-peek-left", "card-hidden");
    if (state === "active") {
      card.classList.add("card-active");
    } else if (state === "peek-right") {
      card.classList.add("card-peek-right");
    } else if (state === "peek-left") {
      card.classList.add("card-peek-left");
    } else {
      card.classList.add("card-hidden");
    }
  }

  function layout() {
    cards.forEach((card, i) => {
      if (i === active) {
        setState(card, "active");
      } else if (i === (active + 1) % cards.length) {
        setState(card, "peek-right");
      } else if (i === (active - 1 + cards.length) % cards.length) {
        setState(card, "peek-left");
      } else {
        setState(card, "hidden");
      }
    });
  }

  function show(index) {
    if (locked || index === active) return;
    locked = true;
    active = index;
    layout();
    setTimeout(() => { locked = false; }, 500);
  }

  prev.addEventListener("click", () => show(active === 0 ? cards.length - 1 : active - 1));
  next.addEventListener("click", () => show(active === cards.length - 1 ? 0 : active + 1));

  let startX = 0;
  const track = document.getElementById("testimonios-track");
  track.addEventListener("pointerdown", (e) => { startX = e.clientX; track.setPointerCapture(e.pointerId); });
  track.addEventListener("pointerup", (e) => {
    const delta = e.clientX - startX;
    if (Math.abs(delta) > 40) {
      const next = delta < 0 ? (active + 1) % cards.length : active === 0 ? cards.length - 1 : active - 1;
      show(next);
    }
  });
  track.style.touchAction = "pan-y";
  layout();
}

export function destroyTestimonials() {}
