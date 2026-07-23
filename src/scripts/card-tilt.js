let ctx;

export function initCardTilt(gsap) {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const cards = document.querySelectorAll("[data-project-card]");
  if (!cards.length) return;

  ctx = gsap.context(() => {
    cards.forEach((card) => {
      const shine = card.querySelector("[data-card-shine]");

      const onMove = (e) => {
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

      const onLeave = () => {
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
    });
  });
}

export function destroyCardTilt() {
  if (ctx) {
    ctx.kill();
    ctx = null;
  }
}
