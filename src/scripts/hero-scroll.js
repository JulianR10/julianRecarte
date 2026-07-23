let ctx;

export function initHeroScroll(gsap, ScrollTrigger) {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  if (window.innerWidth < 768) return;

  const hero = document.querySelector("#hero");
  if (!hero) return;

  const scrollConfig = {
    trigger: "#hero",
    start: "top top",
    end: "bottom-=20% top",
    scrub: 1,
    onLeave: () => { hero.style.pointerEvents = "none"; },
    onEnterBack: () => { hero.style.pointerEvents = ""; },
  };

  ctx = gsap.context(() => {
    const textContent = hero.querySelector("[data-hero-text]");
    if (textContent) {
      gsap.fromTo(
        textContent,
        { opacity: 1, x: 0, filter: "none" },
        {
          opacity: 0,
          x: 150,
          filter: "blur(3px)",
          ease: "none",
          scrollTrigger: scrollConfig,
        }
      );
    }

    const imageDiv = hero.querySelector("[data-hero-image]");
    if (imageDiv) {
      gsap.to(imageDiv, {
        opacity: 0,
        scale: 0.8,
        ease: "none",
        scrollTrigger: scrollConfig,
      });
    }

    const orbs = hero.querySelectorAll("[data-hero-orb]");
    if (orbs.length) {
      gsap.to(orbs, {
        opacity: 0,
        scale: 0.5,
        ease: "none",
        scrollTrigger: scrollConfig,
      });
    }
  });
}

export function destroyHeroScroll() {
  if (ctx) {
    ctx.kill();
    ctx = null;
  }
}
