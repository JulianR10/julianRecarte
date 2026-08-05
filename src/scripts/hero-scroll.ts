import type gsap from "gsap";
import { defineAnimation } from "@scripts/gsap-factory";

export const heroScroll = defineAnimation((gsap: typeof gsap) => {
  const hero = document.querySelector<HTMLElement>("#hero");
  if (!hero) return;

  const textContent = hero.querySelector<HTMLElement>("[data-hero-text]");
  const imageDiv = hero.querySelector<HTMLElement>("[data-hero-image]");
  const orbs = document.querySelectorAll<HTMLElement>("[data-hero-orb]");

  function createAnimations(isMobile: boolean) {
    const baseConfig = {
      trigger: "#hero",
      start: "top top",
      end: isMobile ? "bottom-=50% top" : "bottom-=20% top",
      scrub: isMobile ? 0.3 : 1,
      onLeave: () => { hero.style.pointerEvents = "none"; },
      onEnterBack: () => { hero.style.pointerEvents = ""; },
    };

    const textEnd: gsap.TweenVars = isMobile
      ? { opacity: 0, ease: "none" }
      : { opacity: 0, x: 150, filter: "none", ease: "none" };

    if (textContent) {
      gsap.fromTo(textContent, { opacity: 1, x: 0, filter: "none" }, {
        ...textEnd,
        scrollTrigger: baseConfig,
      });
    }

    if (imageDiv) {
      gsap.to(imageDiv, {
        opacity: 0,
        scale: isMobile ? 0.85 : 0.8,
        ease: "none",
        scrollTrigger: baseConfig,
      });
    }

    if (orbs.length) {
      gsap.to(orbs, {
        opacity: 0,
        scale: 0.5,
        ease: "none",
        scrollTrigger: baseConfig,
      });
    }
  }

  const mm = gsap.matchMedia();

  mm.add("(max-width: 767px)", () => createAnimations(true));
  mm.add("(min-width: 768px)", () => createAnimations(false));

  return () => {
    hero.style.pointerEvents = "";
    mm.revert();
  };
});
