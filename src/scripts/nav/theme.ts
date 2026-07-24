const themeCleanups: (() => void)[] = [];

function setTheme(dark: boolean, lightBtn: HTMLElement | null, darkBtn: HTMLElement | null, indicator: HTMLElement | null): void {
  if (dark) {
    document.documentElement.classList.add("dark");
    localStorage.setItem("dark-mode", "true");
  } else {
    document.documentElement.classList.remove("dark");
    localStorage.setItem("dark-mode", "false");
  }
  if (indicator) {
    const target = dark ? darkBtn : lightBtn;
    if (target) indicator.style.left = target.offsetLeft + "px";
  }
  if (lightBtn && darkBtn) {
    lightBtn.classList.toggle("text-white", !dark);
    lightBtn.classList.toggle("text-background", dark);
    darkBtn.classList.toggle("text-white", dark);
    darkBtn.classList.toggle("text-dark-muted/60", !dark);
  }
}

export function initTheme(): void {
  const lightBtn = document.getElementById("light-toggle");
  const darkBtn = document.getElementById("dark-toggle");
  const indicator = document.getElementById("theme-indicator");
  const overlayLight = document.getElementById("overlay-light-toggle");
  const overlayDark = document.getElementById("overlay-dark-toggle");

  const lightHandler = () => setTheme(false, lightBtn, darkBtn, indicator);
  const darkHandler = () => setTheme(true, lightBtn, darkBtn, indicator);

  if (lightBtn && darkBtn && indicator) {
    setTheme(document.documentElement.classList.contains("dark"), lightBtn, darkBtn, indicator);
    lightBtn.addEventListener("click", lightHandler);
    darkBtn.addEventListener("click", darkHandler);
    themeCleanups.push(() => {
      lightBtn.removeEventListener("click", lightHandler);
      darkBtn.removeEventListener("click", darkHandler);
    });
  }

  if (overlayLight && overlayDark) {
    overlayLight.addEventListener("click", lightHandler);
    overlayDark.addEventListener("click", darkHandler);
    themeCleanups.push(() => {
      overlayLight.removeEventListener("click", lightHandler);
      overlayDark.removeEventListener("click", darkHandler);
    });
  }
}

export function destroyTheme(): void {
  for (let i = themeCleanups.length - 1; i >= 0; i--) {
    try { themeCleanups[i](); } catch (e) {
      console.warn("[theme] cleanup error:", e);
    }
  }
  themeCleanups.length = 0;
}
