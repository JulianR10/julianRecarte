let ctx;

export function initCineText(gsap, ScrollTrigger) {
  const headings = document.querySelectorAll("[data-reveal-heading]");
  if (!headings.length) return;

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function wrapTextNodes(el) {
    const chars = [];
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null, false);
    const textNodes = [];
    while (walker.nextNode()) textNodes.push(walker.currentNode);

    textNodes.forEach((node) => {
      if (!node.textContent.trim()) return;
      const fragment = document.createDocumentFragment();
      Array.from(node.textContent).forEach((char) => {
        const span = document.createElement("span");
        span.className = "cine-char";
        span.textContent = char === " " ? " " : char;
        fragment.appendChild(span);
        chars.push(span);
      });
      node.parentNode.replaceChild(fragment, node);
    });

    return chars;
  }

  ctx = gsap.context(() => {
    headings.forEach((heading) => {
      if (heading.classList.contains("cine-text-processed")) return;
      const isHero = heading.closest("#hero");
      const chars = wrapTextNodes(heading);
      if (!chars.length) return;

      heading.classList.add("revealed", "cine-text-processed");

      if (!prefersReducedMotion) {
        if (!isHero) {
          gsap.fromTo(
            heading,
            { y: 35 },
            {
              y: 0,
              ease: "none",
              scrollTrigger: {
                trigger: heading,
                start: "top bottom",
                end: "bottom top",
                scrub: 1,
              },
            }
          );
        }

        gsap.fromTo(
          chars,
          { opacity: 0, y: 30, filter: "blur(4px)" },
          {
            opacity: 1,
            y: 0,
            filter: "none",
            duration: 0.8,
            stagger: 0.03,
            ease: "power3.out",
            scrollTrigger: {
              trigger: heading,
              start: "top 85%",
              toggleActions: "play none none none",
            },
          }
        );
      }
    });
  });
}

export function destroyCineText() {
  if (ctx) {
    ctx.kill();
    ctx = null;
  }
}
