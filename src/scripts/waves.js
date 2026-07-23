let ctx;

export function initWaves(gsap) {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const paths = document.querySelectorAll("[data-wave]");
  if (!paths.length) return;

  const variants = [
    [
      "M-200,300 C50,100 300,500 550,300 C800,100 1050,500 1300,300 C1550,100 1800,500 2000,300",
      "M-200,250 C50,450 300,150 550,350 C800,550 1050,150 1300,250 C1550,450 1800,150 2000,350",
    ],
    [
      "M-200,500 C50,700 300,300 550,500 C800,700 1050,300 1300,500 C1550,700 1800,300 2000,500",
      "M-200,450 C50,250 300,650 550,450 C800,250 1050,650 1300,450 C1550,250 1800,650 2000,450",
    ],
    [
      "M-200,700 C50,500 300,900 550,700 C800,500 1050,900 1300,700 C1550,500 1800,900 2000,700",
      "M-200,650 C50,850 300,550 550,750 C800,950 1050,550 1300,650 C1550,850 1800,550 2000,750",
    ],
  ];

  ctx = gsap.context(() => {
    paths.forEach((path, i) => {
      const v = variants[i];
      if (!v) return;

      gsap.to(path, {
        attr: { d: v[1] },
        duration: 4 + i * 1.5,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
    });
  });
}

export function destroyWaves() {
  if (ctx) {
    ctx.kill();
    ctx = null;
  }
}
