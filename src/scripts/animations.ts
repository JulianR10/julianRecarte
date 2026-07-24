import gsap from "gsap";
import { defineAnimation } from "@scripts/gsap-factory";

export const progressAnimations = defineAnimation((_gsap: typeof gsap) => {
  const bar = document.getElementById("progress-bar");
  if (bar) {
    _gsap.to(bar, {
      scaleX: 1,
      ease: "none",
      scrollTrigger: {
        trigger: document.body,
        start: "top top",
        end: "bottom bottom",
        scrub: 0,
      },
    });
  }

  const pLine = document.getElementById("process-line");
  if (pLine) {
    _gsap.to(pLine, {
      scaleY: 1,
      ease: "none",
      scrollTrigger: {
        trigger: "#process-wrap",
        start: "top 80%",
        end: "bottom center",
        scrub: 1,
      },
    });
  }

  const steps = document.querySelectorAll<HTMLElement>("[data-process-step]");
  steps.forEach((step) => {
    const img = step.querySelector("img");
    if (!img) return;

    _gsap.fromTo(img,
      { scale: 1 },
      {
        scale: 1.08,
        ease: "power2.out",
        scrollTrigger: {
          trigger: step,
          start: "top 70%",
          end: "bottom 30%",
          toggleActions: "play none none reverse",
        },
      }
    );
  });
});
