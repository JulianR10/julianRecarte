import { initNavbarHeight, destroyNavbarHeight } from "@scripts/nav/navbar-height";
import { initActiveSection, destroyActiveSection } from "@scripts/nav/active-section";
import { initTheme, destroyTheme } from "@scripts/nav/theme";
import { initMobileMenu, destroyMobileMenu } from "@scripts/nav/mobile-menu";
import { initLangSelector, destroyLangSelector } from "@scripts/nav/lang-selector";
import { initAutoHide, destroyAutoHide } from "@scripts/nav/auto-hide";

export function initNav(): void {
  initNavbarHeight();
  initActiveSection();
  initTheme();
  initMobileMenu();
  initLangSelector();
  initAutoHide();
}

export function destroyNav(): void {
  destroyNavbarHeight();
  destroyActiveSection();
  destroyTheme();
  destroyMobileMenu();
  destroyLangSelector();
  destroyAutoHide();
}
