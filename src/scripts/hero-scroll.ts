import gsap from "gsap";
import { defineAnimation } from "@scripts/gsap-factory";

export const heroScroll = defineAnimation((_gsap: typeof gsap) => {
  const hero = document.querySelector<HTMLElement>("#hero");
  if (!hero) return;

  const isMobile = window.innerWidth < 768;

  const baseConfig = {
    trigger: "#hero",
    start: "top top",
    end: `bottom${isMobile ? "" : "-=20%"} top`,
    scrub: 1,
    onLeave: () => { hero.style.pointerEvents = "none"; },
    onEnterBack: () => { hero.style.pointerEvents = ""; },
  };

  const textContent = hero.querySelector<HTMLElement>("[data-hero-text]");
  if (textContent) {
    const textEnd: gsap.TweenVars = isMobile
      ? { opacity: 0, ease: "none" }
      : { opacity: 0, x: 150, filter: "blur(3px)", ease: "none" };

    _gsap.fromTo(textContent, { opacity: 1, x: 0, filter: "none" }, {
      ...textEnd,
      scrollTrigger: baseConfig,
    });
  }

  const imageDiv = hero.querySelector<HTMLElement>("[data-hero-image]");
  if (imageDiv) {
    _gsap.to(imageDiv, {
      opacity: 0,
      scale: isMobile ? 0.85 : 0.8,
      ease: "none",
      scrollTrigger: baseConfig,
    });
  }

  const orbs = hero.querySelectorAll<HTMLElement>("[data-hero-orb]");
  if (orbs.length) {
    _gsap.to(orbs, {
      opacity: 0,
      scale: 0.5,
      ease: "none",
      scrollTrigger: baseConfig,
    });
  }
});
