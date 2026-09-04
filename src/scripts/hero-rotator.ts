import type gsap from "gsap";
import { defineAnimation } from "@scripts/gsap-factory";

/** Tiempo visible de cada palabra antes de rotar (decidido con Julián). */
const DWELL_SECONDS = 3.5;
/** Duración del desliz de ancho al cambiar de palabra. */
const WIDTH_SECONDS = 0.4;

export const heroRotator = defineAnimation((gsap: typeof gsap) => {
  const rotator = document.querySelector<HTMLElement>("[data-rotator]");
  if (!rotator) return;
  const words = Array.from(rotator.querySelectorAll<HTMLElement>("[data-rotator-word]"));
  if (words.length < 2) return;

  let current = 0;
  let alive = true;
  let busy = false;
  let timer: { kill(): void } | null = null;

  const baseOf = (word: HTMLElement): HTMLElement =>
    word.querySelector<HTMLElement>(".rotator-base") ?? word;

  const measure = (word: HTMLElement): number => baseOf(word).offsetWidth;

  function lockWidth(px: number): void {
    gsap.set(rotator, { width: px, display: "inline-block" });
  }

  /** Parpadeo eléctrico de los clones, sin tocar la base (arranque sin redundancia). */
  function zapFlashOnly(word: HTMLElement): void {
    const clones = Array.from(word.querySelectorAll<HTMLElement>("[data-rotator-zap]"));
    let delay = 0;
    for (let i = 0; i < 2; i++) {
      const clone = clones[i % clones.length];
      if (!clone) continue;
      gsap
        .timeline()
        .set(clone, { opacity: 0 })
        .to(clone, {
          opacity: gsap.utils.random(0.6, 1),
          scale: gsap.utils.random(1.03, 1.08),
          x: gsap.utils.random(-5, 5),
          y: gsap.utils.random(-3, 3),
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
      delay += gsap.utils.random(0.04, 0.1);
    }
  }

  /** Zap eléctrico de ENTRADA: 2 flashes de clones + base con y/blur. */
  function zapIn(word: HTMLElement): void {
    zapFlashOnly(word);
    gsap.fromTo(
      baseOf(word),
      { y: 14, opacity: 0, filter: "blur(6px)" },
      { y: 0, opacity: 1, filter: "none", duration: 0.45, ease: "power3.out", overwrite: "auto" }
    );
  }

  /** Rotación: salida simple + ancho animado al tamaño real de la entrante. */
  function show(next: number): void {
    if (!alive || busy) return;
    const prev = words[current];
    const incoming = words[next];
    if (!prev || !incoming || prev === incoming) return;
    busy = true;

    // 1. Fijar el ancho actual para que nada salte.
    lockWidth(measure(prev));

    // 2. La saliente pasa a overlay (ya no ocupa lugar); la entrante entra en flujo.
    gsap.set(prev, { position: "absolute", left: 0, top: 0 });
    gsap.set(incoming, { position: "relative", opacity: 1, visibility: "visible" });
    incoming.removeAttribute("aria-hidden");

    // 3. Medir la entrante en flujo y deslizar el ancho + resto de la frase.
    const targetWidth = measure(incoming);
    gsap.to(rotator, {
      width: targetWidth,
      duration: WIDTH_SECONDS,
      ease: "power3.out",
      overwrite: "auto",
    });

    // 4. Salida simple de la anterior (sin zap).
    gsap.to(baseOf(prev), {
      opacity: 0,
      y: -12,
      filter: "blur(4px)",
      duration: 0.25,
      ease: "power2.in",
      overwrite: "auto",
      onComplete: () => {
        if (!alive) return;
        gsap.set(prev, { opacity: 0, visibility: "hidden" });
        prev.setAttribute("aria-hidden", "true");
        zapIn(incoming);
        current = next;
        busy = false;
      },
    });
  }

  function schedule(): void {
    if (!alive) return;
    timer = gsap.delayedCall(DWELL_SECONDS, () => {
      if (!alive) return;
      // Pestaña oculta: no avanzar, reintentar en el próximo dwell.
      if (document.hidden) {
        schedule();
        return;
      }
      show((current + 1) % words.length);
      schedule();
    });
  }

  // Estado inicial: solo la primera palabra en flujo; el resto en overlay oculto.
  words.forEach((word, i) => {
    if (i === 0) {
      gsap.set(word, { position: "relative", opacity: 1, visibility: "visible" });
    } else {
      gsap.set(word, { position: "absolute", left: 0, top: 0, opacity: 0, visibility: "hidden" });
      gsap.set(baseOf(word), { opacity: 1, y: 0, filter: "none" });
    }
  });
  lockWidth(measure(words[0]));

  // Re-medir cuando cargan las fuentes o cambia el viewport (ancho por idioma).
  const remeasure = (): void => {
    if (!alive || busy) return;
    lockWidth(measure(words[current]));
  };
  const onResize = (): void => remeasure();
  window.addEventListener("resize", onResize);
  if (document.fonts) {
    document.fonts.ready.then(() => remeasure()).catch(() => {});
  }

  // Arranque: solo flash de clones sobre "ideas", sin re-animar la base.
  timer = gsap.delayedCall(0.7, () => {
    if (!alive || document.hidden) return;
    zapFlashOnly(words[0]);
  });
  schedule();

  return () => {
    alive = false;
    timer?.kill();
    timer = null;
    window.removeEventListener("resize", onResize);
  };
});
