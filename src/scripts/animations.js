import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (reducedMotion) {
  document.querySelectorAll("[data-reveal], [data-reveal-stagger], [data-hero-cta], [data-hero-buttons]").forEach(el => {
    el.style.opacity = "1";
    el.style.transform = "none";
  });
  document.querySelectorAll("[data-cursor]").forEach(el => {
    el.style.display = "none";
  });
} else {

function splitTextIntoSpans(element) {
  const frag = document.createDocumentFragment();
  const children = Array.from(element.childNodes);
  element.textContent = "";
  children.forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const words = node.textContent.trim().split(/\s+/);
      words.forEach((word, i) => {
        if (!word) return;
        const span = document.createElement("span");
        span.textContent = word;
        span.style.display = "inline-block";
        frag.appendChild(span);
        if (i < words.length - 1) {
          frag.appendChild(document.createTextNode(" "));
        }
      });
    } else {
      frag.appendChild(node.cloneNode(true));
    }
  });
  element.appendChild(frag);
  return element.querySelectorAll("span");
}

const heroHeadings = document.querySelectorAll("[data-hero-heading]");
const heroCta = document.querySelector("[data-hero-cta]");
const heroButtons = document.querySelector("[data-hero-buttons]");

if (heroHeadings.length) {
  const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
  let allWords = [];

  heroHeadings.forEach((el) => {
    const typewriter = el.querySelector("[data-typewriter]");
    const cursor = el.querySelector("[data-cursor]");

    if (typewriter) {
      const text = typewriter.textContent.trim();
      typewriter.textContent = "";
      const words = text.split(" ");
      let wordIdx = 0;
      let charIdx = 0;
      let currentWord = null;

      const tick = () => {
        if (wordIdx >= words.length) {
          if (cursor) {
            cursor.style.opacity = "1";
            const blink = setInterval(() => {
              cursor.style.opacity = cursor.style.opacity === "1" ? "0" : "1";
            }, 400);
            blink._id = "cursor-blink";
          }
          return;
        }

        if (charIdx === 0) {
          if (wordIdx > 0) {
            const space = document.createElement("span");
            space.innerHTML = "&nbsp;";
            typewriter.appendChild(space);
          }
          currentWord = document.createElement("span");
          currentWord.style.display = "inline-block";
          currentWord.style.verticalAlign = "baseline";
          typewriter.appendChild(currentWord);
        }

        const char = words[wordIdx][charIdx];
        const span = document.createElement("span");
        span.textContent = char;
        currentWord.appendChild(span);
        charIdx++;

        if (charIdx >= words[wordIdx].length) {
          wordIdx++;
          charIdx = 0;
          currentWord = null;
        }

        setTimeout(tick, 60);
      };

      tick();
    } else {
      const words = splitTextIntoSpans(el);
      allWords = allWords.concat(Array.from(words));
    }
  });

  if (heroCta) {
    tl.from(heroCta, { y: 30, opacity: 0, duration: 0.6 }, "-=0.2");
  }

  if (heroButtons) {
    tl.from(
      heroButtons.children,
      { y: 30, opacity: 0, scale: 0.9, stagger: 0.15, duration: 0.6 },
      "-=0.3"
    );
  }

  const pulseLine = Array.from(allWords).find(
    (w) => w.textContent.includes("destacar")
  );
  if (pulseLine) {
    const text = pulseLine.textContent;
    const idx = text.indexOf("destacar");
    const before = text.slice(0, idx);
    const after = text.slice(idx + "destacar".length);

    pulseLine.textContent = "";

    if (before) {
      const beforeSpan = document.createElement("span");
      beforeSpan.textContent = before;
      beforeSpan.style.display = "inline-block";
      pulseLine.appendChild(beforeSpan);
    }

    const chars = "destacar".split("").map((char) => {
      const span = document.createElement("span");
      span.textContent = char;
      span.style.display = "inline-block";
      return span;
    });
    chars.forEach((c) => pulseLine.appendChild(c));

    if (after) {
      const afterSpan = document.createElement("span");
      afterSpan.textContent = after;
      afterSpan.style.display = "inline-block";
      pulseLine.appendChild(afterSpan);
    }

    gsap.to(chars, {
      color: "#FF5C2B",
      fontStyle: "italic",
      duration: 1.2,
      stagger: { each: 0.15, from: "start" },
      ease: "sine.inOut",
      repeat: -1,
      yoyo: true,
    });
  }
}

const revealElements = document.querySelectorAll("[data-reveal]");
revealElements.forEach((el) => {
  const direction = el.dataset.reveal || "up";
  const delay = parseFloat(el.dataset.revealDelay) || 0;
  const config = {
    up: { y: 80, opacity: 0 },
    down: { y: -80, opacity: 0 },
    left: { x: -80, opacity: 0 },
    right: { x: 80, opacity: 0 },
  };
  gsap.from(el, {
    scrollTrigger: {
      trigger: el,
      start: "top 85%",
      toggleActions: "play none none reverse",
    },
    ...(config[direction] || config.up),
    duration: 1,
    delay,
    ease: "power3.out",
  });
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
    stagger: 0.15,
    duration: 0.8,
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

  ScrollTrigger.refresh();
}
