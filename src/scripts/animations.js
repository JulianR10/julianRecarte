import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const isMobile = window.innerWidth < 768;

if (reducedMotion) {
  document.querySelectorAll("[data-reveal], [data-reveal-stagger], [data-reveal-heading]").forEach(el => {
    el.style.opacity = "1";
    el.style.transform = "none";
  });
} else {

// ===== PROGRESS BAR =====
const progressBar = document.getElementById("progress-bar");
if (progressBar) {
  gsap.to(progressBar, {
    scrollTrigger: {
      trigger: document.body,
      start: "top top",
      end: "bottom bottom",
      scrub: 0.5,
    },
    scaleX: 1,
    ease: "none",
  });
}

// ===== PROCESS LINE DRAW =====
const processLine = document.getElementById("process-line");
const processWrap = document.getElementById("process-wrap");
if (processLine && processWrap) {
  gsap.to(processLine, {
    scrollTrigger: {
      trigger: processWrap,
      start: "top 70%",
      end: "bottom 30%",
      scrub: 1,
    },
    scaleY: 1,
    ease: "none",
  });
}

// ===== SCROLL FADE-UP (headings, content, anything with data-reveal or data-reveal-heading) =====
const revealElements = document.querySelectorAll("[data-reveal], [data-reveal-heading]");
revealElements.forEach((el) => {
  gsap.fromTo(el,
    { y: 60, opacity: 0 },
    {
      scrollTrigger: {
        trigger: el,
        start: "top 85%",
        toggleActions: isMobile ? "play none none none" : "play none none reverse",
      },
      y: 0,
      opacity: 1,
      duration: isMobile ? 0.8 : 1.2,
      ease: "power4.out",
    }
  );
});

// ===== STAGGER FADE-UP (cards grid) =====
const revealStagger = document.querySelectorAll("[data-reveal-stagger]");
revealStagger.forEach((container) => {
  const items = container.children;
  gsap.set(items, { y: 60, opacity: 0 });
  gsap.to(items, {
    scrollTrigger: {
      trigger: container,
      start: "top 85%",
    },
    y: 0,
    opacity: 1,
    stagger: isMobile ? 0.1 : 0.12,
    duration: isMobile ? 0.7 : 1.0,
    ease: "power4.out",
  });
});

  ScrollTrigger.refresh();
}
