import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const isMobile = window.innerWidth < 768;

if (reducedMotion) {
  document.querySelectorAll("[data-reveal], [data-reveal-stagger], [data-split-text], [data-hero-cta], [data-hero-buttons]").forEach(el => {
    el.style.opacity = "1";
    el.style.transform = "none";
  });
} else {

// ===== 1. LOAD STAGGER: NAV =====
const loadTl = gsap.timeline({ defaults: { ease: "power3.out" } });

const navItems = document.querySelectorAll("#main-nav .desktop-link, #lang-btn, #theme-toggle");
if (navItems.length) {
  gsap.set(navItems, { opacity: 0, y: -20 });
  loadTl.to(navItems, { opacity: 1, y: 0, stagger: 0.05, duration: 0.4 }, 0);
}

// ===== 6. PROGRESS BAR =====
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

function splitTextIntoChars(element) {
  const text = element.textContent;
  element.textContent = "";
  const chars = [];
  const groups = text.split(/(\s+)/);

  groups.forEach((group) => {
    if (/^\s+$/.test(group)) {
      element.appendChild(document.createTextNode(group));
    } else if (group.length > 0) {
      const wrapper = document.createElement("span");
      wrapper.style.display = "inline-block";
      wrapper.style.whiteSpace = "nowrap";

      for (let i = 0; i < group.length; i++) {
        const span = document.createElement("span");
        span.textContent = group[i];
        span.style.display = "inline-block";
        wrapper.appendChild(span);
        chars.push(span);
      }

      element.appendChild(wrapper);
    }
  });

  return chars;
}

const splitElements = document.querySelectorAll("[data-split-text]");
let allCharSpans = [];
const splitData = [];

if (splitElements.length) {
  splitElements.forEach((el) => {
    const chars = splitTextIntoChars(el);
    if (chars.length) {
      splitData.push({ el, chars });
      allCharSpans = allCharSpans.concat(chars);
    }
  });
}

if (allCharSpans.length) {
  const staggerVal = isMobile ? 0.008 : 0.012;
  const durVal = isMobile ? 0.25 : 0.35;

  gsap.set(allCharSpans, { opacity: 0, y: 30, filter: "blur(6px)" });

  const splitTl = gsap.timeline({ defaults: { ease: "power3.out" } });

  splitTl.to(allCharSpans, {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    duration: durVal,
    stagger: staggerVal,
  });

  let destacarChars = [];
  for (const { el, chars } of splitData) {
    const fullText = chars.map((s) => s.textContent).join("");
    const idx = fullText.indexOf("destacar");
    if (idx !== -1) {
      destacarChars = chars.slice(idx, idx + 8);
      break;
    }
  }

  splitTl.call(() => {
    if (destacarChars.length) {
      gsap.to(destacarChars, {
        color: "#FF5C2B",
        fontStyle: "italic",
        duration: 1.2,
        stagger: { each: 0.15, from: "start" },
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
      });
    }
  });

  const heroCta = document.querySelector("[data-hero-cta]");
  if (heroCta) {
    splitTl.from(heroCta, { y: 20, opacity: 0, duration: 0.5 });
  }

  const heroButtons = document.querySelector("[data-hero-buttons]");
  if (heroButtons) {
    splitTl.from(
      heroButtons.children,
      { y: 20, opacity: 0, scale: 0.9, stagger: 0.1, duration: 0.5 },
      "-=0.1"
    );
  }
}

// ===== 3. SECTION HEADINGS CLIP-PATH REVEAL =====
const revealHeadings = document.querySelectorAll("[data-reveal-heading]");
revealHeadings.forEach((el) => {
  gsap.from(el, {
    scrollTrigger: {
      trigger: el,
      start: "top 85%",
    },
    clipPath: "inset(0 100% 0 0)",
    duration: 2,
    ease: "power2.out",
  });
});

// ===== 4. PROCESS LINE DRAW =====
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

// ===== SCROLL REVEAL (with explicit fromTo to avoid CSS conflicts) =====
const revealElements = document.querySelectorAll("[data-reveal]");
revealElements.forEach((el) => {
  const direction = el.dataset.reveal || "up";
  const delay = parseFloat(el.dataset.revealDelay) || 0;
  const config = {
    up: { y: 80 },
    down: { y: -80 },
    left: { x: -80 },
    right: { x: 80 },
  };
  gsap.fromTo(el,
    { ...(config[direction] || config.up), opacity: 0 },
    {
      scrollTrigger: {
        trigger: el,
        start: "top 85%",
        toggleActions: isMobile ? "play none none none" : "play none none reverse",
      },
      y: 0,
      x: 0,
      opacity: 1,
      duration: isMobile ? 0.5 : 1,
      delay,
      ease: "power3.out",
    }
  );
});

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
    stagger: isMobile ? 0.08 : 0.15,
    duration: isMobile ? 0.4 : 0.8,
    ease: "power3.out",
  });
});

document.querySelectorAll("[data-magnetic]").forEach((el) => {
  gsap.set(el, { x: 0, y: 0, scale: 1 });
  el.addEventListener("mouseenter", () => {
    gsap.to(el, { scale: 1.05, duration: 0.3, ease: "power2.out" });
  });
  el.addEventListener("mousemove", (e) => {
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) * 0.125;
    const y = (e.clientY - rect.top - rect.height / 2) * 0.125;
    gsap.to(el, { x, y, duration: 0.4, ease: "power2.out" });
  });
  el.addEventListener("mouseleave", () => {
    gsap.to(el, { x: 0, y: 0, scale: 1, duration: 0.6, ease: "power3.out" });
  });
});

// ===== PARALLAX LAYERS =====
const parallaxLayers = document.querySelectorAll("[data-parallax]");
if (parallaxLayers.length) {
  document.addEventListener("mousemove", (e) => {
    const mx = (e.clientX / window.innerWidth - 0.5) * 2;
    const my = (e.clientY / window.innerHeight - 0.5) * 2;

    parallaxLayers.forEach((layer) => {
      const speed = parseFloat(layer.dataset.parallax) || 0.3;
      gsap.to(layer, {
        x: mx * 80 * speed,
        y: my * 60 * speed,
        duration: 1.2,
        ease: "power3.out",
        overwrite: "auto",
      });
    });
  });
}

  ScrollTrigger.refresh();
}
