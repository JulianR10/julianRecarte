let ctx;

export function initHeroZap(gsap) {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const clones = Array.from(document.querySelectorAll("[data-zap-clone]"));
  if (!clones.length) return;

  ctx = gsap.context(() => {
    function burst() {
      const flashCount = gsap.utils.random(2, 3);
      let delay = 0;

      for (let i = 0; i < flashCount; i++) {
        const clone = clones[i % clones.length];
        const scale = gsap.utils.random(1.03, 1.08);
        const x = gsap.utils.random(-5, 5);
        const y = gsap.utils.random(-3, 3);

        gsap
          .timeline()
          .set(clone, { opacity: 0 })
          .to(clone, {
            opacity: gsap.utils.random(0.6, 1),
            scale,
            x,
            y,
            duration: 0.04,
            ease: "none",
            delay,
          })
          .to(clone, {
            opacity: 0,
            scale: 1,
            x: 0,
            y: 0,
            duration: 0.12,
            ease: "none",
          });

        delay += gsap.utils.random(0.04, 0.1);
      }

      gsap.delayedCall(gsap.utils.random(1.5, 4), burst);
    }

    burst();
  });
}

export function destroyHeroZap() {
  if (ctx) {
    ctx.kill();
    ctx = null;
  }
}
