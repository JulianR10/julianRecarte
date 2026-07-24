import gsap from "gsap";
import { defineAnimation } from "@scripts/gsap-factory";

export const heroZap = defineAnimation((_gsap: typeof gsap) => {
  const clones = Array.from(document.querySelectorAll<HTMLElement>("[data-zap-clone]"));
  if (!clones.length) return;

  function burst(): void {
    const flashCount = _gsap.utils.random(2, 3);
    let delay = 0;

    for (let i = 0; i < flashCount; i++) {
      const clone = clones[i % clones.length];
      const scale = _gsap.utils.random(1.03, 1.08);
      const x = _gsap.utils.random(-5, 5);
      const y = _gsap.utils.random(-3, 3);

      _gsap
        .timeline()
        .set(clone, { opacity: 0 })
        .to(clone, {
          opacity: _gsap.utils.random(0.6, 1),
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

      delay += _gsap.utils.random(0.04, 0.1);
    }

    _gsap.delayedCall(_gsap.utils.random(1.5, 4), burst);
  }

  burst();
});
